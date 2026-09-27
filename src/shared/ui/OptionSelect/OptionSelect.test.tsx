import { expect, jest, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OptionSelect } from './OptionSelect'

test('should report the selected option', async () => {
  const user = userEvent.setup()
  const onChange = jest.fn()
  render(
    <OptionSelect
      label="Currency"
      value="BTCUSDT"
      options={[
        { value: 'BTCUSDT', label: 'Bitcoin' },
        { value: 'ETHUSDT', label: 'Ethereum' },
      ]}
      onChange={onChange}
    />,
  )

  await user.click(screen.getByRole('combobox', { name: 'Currency' }))
  await user.click(screen.getByRole('option', { name: 'Ethereum' }))
  expect(onChange).toHaveBeenCalledWith('ETHUSDT')
})

test('should keep page scrolling available while the menu is open', async () => {
  const user = userEvent.setup()
  render(
    <OptionSelect
      label="Currency"
      value="BTCUSDT"
      options={[
        { value: 'BTCUSDT', label: 'Bitcoin' },
        { value: 'ETHUSDT', label: 'Ethereum' },
      ]}
      onChange={jest.fn()}
    />,
  )

  await user.click(screen.getByRole('combobox', { name: 'Currency' }))

  expect(screen.getByRole('listbox')).toBeVisible()
  expect(document.body.style.overflow).not.toBe('hidden')
})
