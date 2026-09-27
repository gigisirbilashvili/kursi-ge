import { expect, jest, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
import { PairManager } from './PairManager'

test('should expand pair management and add the selected available currency', async () => {
  const user = userEvent.setup()
  const onAdd = jest.fn()
  const currencies = AVAILABLE_CURRENCIES.slice(0, 1)
  render(<PairManager currencies={currencies} onAdd={onAdd} onRemove={jest.fn()} />)

  const toggle = screen.getByRole('button', { name: 'Manage pairs (1)' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('button', { name: 'Add pair' })).not.toBeInTheDocument()

  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await user.click(screen.getByRole('button', { name: 'Add pair' }))
  expect(onAdd).toHaveBeenCalledWith(AVAILABLE_CURRENCIES[1].symbol)

  await user.click(toggle)
  expect(screen.queryByRole('button', { name: 'Add pair' })).not.toBeInTheDocument()
})
