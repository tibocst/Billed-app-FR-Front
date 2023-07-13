/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom'
import { ROUTES, ROUTES_PATH } from "../constants/routes"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should submit a form", async () => {

      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId("form-new-bill"))

      const form = screen.getByTestId("form-new-bill")
      const fileInput = screen.getByTestId('file')
      const expenseTypeInput = screen.getByTestId("expense-type")
      const expenseNameInput = screen.getByTestId("expense-name")
      const datePickerInput = screen.getByTestId("datepicker")
      const amountInput = screen.getByTestId("amount")
      const vatInput = screen.getByTestId("vat")
      const pctInput = screen.getByTestId("pct")
      const commentaryInput = screen.getByTestId("commentary")

      fireEvent.change(expenseTypeInput, { target: { value: "Transports" } })
      fireEvent.change(expenseNameInput, { target: { value: "TGV" } })
      fireEvent.change(datePickerInput, { target: { value: "2023-06-10" } })
      fireEvent.change(amountInput, { target: { value: 100 } })
      fireEvent.change(vatInput, { target: { value: 20 } })
      fireEvent.change(pctInput, { target: { value: 70 } })
      fireEvent.change(commentaryInput, { target: { value: "Train en retard!" } })
      
      const onNavigate = (pathname) => {
        document.innerHTML = ROUTES({ pathname })
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const mockUpdateBill = jest.spyOn(newBill, 'updateBill')
      const mockOnNavigate = jest.spyOn(newBill, 'onNavigate')

      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockUpdateBill).toHaveBeenCalledWith({
          "email": JSON.parse(localStorageMock.getItem("user")).email,
          "type": "Transports",
          "name": "TGV",
          "amount": 100,
          "date": "2023-06-10",
          "commentary": "Train en retard!",
          "fileName": null,
          "fileUrl": null,
          "pct": 70,
          "vat": "20",
          "status": "pending",
        })
        expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
      })
    })

    test("Then if i add a file it should call handleChangeFile", async () => {

      const onNavigate = (pathname) => {
        document.innerHTML = ROUTES({ pathname })
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId("form-new-bill"))

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const buttonFile = screen.getByTestId("file")

      fireEvent.change(buttonFile, {
        target: { files: [new File(['test'], 'test.png', { type: 'image/png' })] },
      });
      await waitFor(() => {
        expect(newBill.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
      })
    })
  })
})
