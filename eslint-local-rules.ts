import { builtinModules } from 'node:module'
import path from 'node:path'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import type { Rule } from 'eslint'

type LocalRule = TSESLint.RuleModule<'invalid', []>
const rule = (create: LocalRule['create']): Rule.RuleModule => {
  const implementation: LocalRule = { meta: { type: 'suggestion', schema: [], messages: { invalid: '{{message}}' } }, defaultOptions: [], create }
  return implementation as unknown as Rule.RuleModule
}
const report = (context: TSESLint.RuleContext<'invalid', []>, node: TSESTree.Node | TSESTree.Comment, message: string) => context.report({ node, messageId: 'invalid', data: { message } })
const containsJsx = (node: unknown): boolean => {
  if (!node || typeof node !== 'object') return false
  if ('type' in node && (node.type === 'JSXElement' || node.type === 'JSXFragment')) return true
  return Object.entries(node).some(([key, value]) => key !== 'parent' && key !== 'tokens' && key !== 'comments' &&
    (Array.isArray(value) ? value.some(containsJsx) : containsJsx(value)))
}
const identifiers = (node: TSESTree.Node | null): TSESTree.Identifier[] => {
  if (!node) return []
  if (node.type === 'Identifier') return [node]
  if (node.type === 'RestElement') return identifiers(node.argument)
  if (node.type === 'AssignmentPattern') return identifiers(node.left)
  if (node.type === 'ArrayPattern') return node.elements.flatMap(identifiers)
  if (node.type === 'ObjectPattern') return node.properties.flatMap((item) => identifiers(item.type === 'Property' ? item.value : item.argument))
  return []
}

export default {
  rules: {
    'todo-comments-only': rule((context) => ({
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!/^TODO::\s+\S/.test(comment.value.trim())) report(context, comment, 'Only comments starting with TODO:: followed by an actionable task are allowed.')
        }
      },
    })),
    'type-files-only': rule((context) => ({
      Program(node) {
        const filename = context.filename.replaceAll('\\', '/')
        if (!/(?:\/types\/|\/types\.[^/]+$)/.test(filename)) return
        if (!filename.endsWith('.ts')) report(context, node, 'Type files must use .ts.')
        for (const statement of node.body) {
          const declaration = 'declaration' in statement ? statement.declaration ?? statement : statement
          const isType = ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSDeclareFunction'].includes(declaration.type)
          const isImport = statement.type === 'ImportDeclaration' && (statement.importKind === 'type' || (statement.specifiers.length > 0 && statement.specifiers.every((item) => item.type === 'ImportSpecifier' && item.importKind === 'type')))
          const isExport = (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportAllDeclaration') && statement.exportKind === 'type' && !('declaration' in statement && statement.declaration)
          if (!isType && !isImport && !isExport) report(context, statement, 'Type files may only contain type declarations, type imports, and type exports; move runtime values elsewhere.')
        }
      },
    })),
    'constant-names': rule((context) => ({
      VariableDeclaration(node) {
        if (!/(?:^|\/)(?:constants\.[^/]+|constants\/.*)$/.test(context.filename.replaceAll('\\', '/'))) return
        if (node.parent.type !== 'Program' && node.parent.type !== 'ExportNamedDeclaration') return
        if (node.kind !== 'const') report(context, node, 'Top-level values in constants files must use const.')
        for (const declaration of node.declarations) for (const id of identifiers(declaration.id)) {
          if (!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(id.name)) report(context, id, 'Constant names must use UPPER_SNAKE_CASE.')
        }
      },
    })),
    'import-order': rule((context) => ({
      Program(node) {
        let previous = -1
        for (const entry of node.body.filter((item) => item.type === 'ImportDeclaration')) {
          const name = entry.source.value
          const rank = /\.(?:css|scss|sass|less)(?:\?.*)?$/.test(name) ? 3
            : name.startsWith('node:') || builtinModules.includes(name) ? 0
              : /^(?:\.|\/|@\/|~\/|src\/)/.test(name) ? 2 : 1
          if (rank < previous) report(context, entry, 'Import order must be built-in → external → project/internal → styles (including type and side-effect imports).')
          previous = Math.max(previous, rank)
        }
      },
    })),
    'component-props': rule((context) => {
      const check = (node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression, name: string | undefined) => {
        if (!name || !/^[A-Z]/.test(name) || !containsJsx(node.body) || node.params.length === 0) return
        const param = node.params[0].type === 'AssignmentPattern' ? node.params[0].left : node.params[0]
        let annotation = 'typeAnnotation' in param ? param.typeAnnotation?.typeAnnotation : undefined
        if (annotation?.type === 'TSTypeReference' && annotation.typeName.type === 'Identifier' &&
          annotation.typeName.name === 'Readonly' && annotation.typeArguments?.params.length === 1) {
          annotation = annotation.typeArguments.params[0]
        }
        const expected = `I${name}Props`
        const imports = context.sourceCode.ast.body.filter((item) => item.type === 'ImportDeclaration')
        const reference = annotation?.type === 'TSTypeReference' && annotation.typeName.type === 'Identifier' ? annotation.typeName.name : null
        const source = imports.find((entry) => entry.specifiers.some((specifier) => specifier.type === 'ImportSpecifier' && specifier.local.name === reference && specifier.imported.type === 'Identifier' && specifier.imported.name === expected))
        const filename = context.filename.replaceAll('\\', '/')
        const target = source && path.posix.normalize(path.posix.join(path.posix.dirname(filename), source.source.value))
        const ownTypes = path.posix.join(path.posix.dirname(filename), 'types')
        const isOwnTypes = source?.source.value.startsWith('.') && (target === ownTypes || target?.startsWith(`${ownTypes}/`))
        if (reference !== expected || !isOwnTypes || !source || source.range[0] > node.range[0]) {
          report(context, param, `Use ${expected}, imported above the component from its adjacent ./types folder. Put each component in its own folder.`)
        }
      }
      return {
        FunctionDeclaration(node) { check(node, node.id?.name) },
        VariableDeclarator(node) {
          let value: TSESTree.Node | null = node.init
          while (value?.type === 'CallExpression') value = value.arguments[0]
          if (value && (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') && node.id.type === 'Identifier') check(value, node.id.name)
        },
        'TSInterfaceDeclaration, TSTypeAliasDeclaration'(node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration) {
          if (/Props$/.test(node.id.name) && !context.filename.replaceAll('\\', '/').includes('/types/')) report(context, node, 'Component props declarations belong in the corresponding component types folder.')
        },
      }
    }),
  },
}
