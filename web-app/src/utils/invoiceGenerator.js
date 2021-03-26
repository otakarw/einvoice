import {isEmpty} from 'lodash'
import {capitalizeFirstChar} from './helpers'
import {rootAttributes} from './constants'

const generateInvoiceXml = async (name, data, indent, additionalAttributes) => {
  let openingTag = `${' '.repeat(indent)}<${name}>`
  const attributes = {
    ...data.attributes,
    ...additionalAttributes,
  }
  if (!isEmpty(attributes)) {
    // Filter attributes that were not set
    const setAttributes = Object.entries(attributes).filter(([k, v]) => v.length > 0)
    const attributesString = setAttributes.map(([k, v]) => `${k}="${v[0].text}"`).join(' ')
    openingTag = `${openingTag.slice(0, -1)} ${attributesString}>`
  }

  // Text inside of tag
  if (data.text != null) {
    return `${openingTag}${data.text}</${name}>`
  }

  const rows = [openingTag]
  if (data.children != null) {
    for (const [name, childArr] of Object.entries(data.children)) {
      for (const child of childArr) {
        rows.push(await generateInvoiceXml(name, child, indent + 2))
      }
    }
  }

  rows.push(`${' '.repeat(indent)}</${name}>`)

  return rows.join('\n')
}

export const generateInvoice = async (formData, invoiceType) => {
  const invoice = await generateInvoiceXml(
    capitalizeFirstChar(invoiceType), formData, 0, rootAttributes(invoiceType),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n${invoice}`
}
