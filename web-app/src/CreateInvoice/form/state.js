import {get} from 'lodash'

const FORM_PATH = ['createInvoiceScreen', 'form']
export const INVOICE_FORM_PATH = [...FORM_PATH, 'invoice']
export const FORM_TYPE_PATH = [...FORM_PATH, 'type']

export const formTypeSelector = (state) => get(state, FORM_TYPE_PATH)

export const invoiceFormSelector = (state) => get(state, INVOICE_FORM_PATH)

export const invoiceFormFieldSelector = (path) => (state) => get(invoiceFormSelector(state), path)

export const isInvoiceFormInitialized = (state) => invoiceFormSelector(state) != null

export const getFormInitialState = (ublDocs) => {
  const result = {}
  if (ublDocs.dataType != null) result.text = ublDocs.defaultValue || ''
  if (ublDocs.attributes != null) {
    result.attributes = {}
    for (const [name, attr] of Object.entries(ublDocs.attributes)) {
      result.attributes[name] = []
      if (attr.cardinality.from !== '0') {
        result.attributes[name].push({text: attr.defaultValue || ''})
      }
    }
  }
  if (ublDocs.children != null) {
    result.children = {}
    for (const [tag, child] of Object.entries(ublDocs.children)) {
      result.children[tag] = []
      for (let i = 0; i < parseInt(child.cardinality.from, 10); i++) {
        result.children[tag].push(getFormInitialState(child))
      }
    }
  }
  return result
}
