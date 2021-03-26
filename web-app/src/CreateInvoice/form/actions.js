import swal from 'sweetalert'
import {dropRight, get} from 'lodash'
import {formDataSelector, FORM_PATH, FORM_TYPE_PATH, getFormInitialState} from './state'
import {setInvoiceSubmissionData} from '../actions'
import {loadingWrapper, setData} from '../../helpers/actions'
import {generateInvoice} from '../../utils/invoiceGenerator'
import i18n from '../../i18n'

export const setFormField = (path) => setData([...FORM_PATH, ...path])
export const setFormType = setData(FORM_TYPE_PATH)

export const addFieldInstance = (path, data) => ({
  type: 'ADD INVOICE FIELD',
  path: [...FORM_PATH, ...path],
  payload: data,
  reducer: (state, data) => [...state, data],
})

export const removeFieldInstance = (path) => ({
  type: 'REMOVE INVOICE FIELD',
  path: [...FORM_PATH, ...path],
  payload: null,
  reducer: (state) => dropRight(state),
})

export const initializeFormState = (invoiceType, docs) => (
  (dispatch) => {
    // Add fake start point and unwrap it at the end
    const initialState = getFormInitialState({
      children: docs,
    }).children
    dispatch(setFormField([invoiceType])(initialState))
  }
)

export const submitInvoiceForm = (invoiceType, rootPath) => loadingWrapper(
  async (dispatch, getState) => {
    const invoiceForm = formDataSelector(getState())
    const xml = await generateInvoice(get(invoiceForm, [...rootPath, 0]), invoiceType)
    const invoiceFile = new File([xml], `${invoiceType}.xml`, {type: 'application/xml'})
    dispatch(setInvoiceSubmissionData(invoiceFile))
  }
)

export const initializeDraftForm = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const {type, data} = await api.drafts.get(id)
      dispatch(setFormField([type])(data))
      dispatch(setFormType(type))
      return true
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getDraft', {id}),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)
