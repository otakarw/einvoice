import {Button} from 'react-bootstrap'
import ConfirmationModal from './ConfirmationModal'

export default ({confirmationTitle, confirmationText, onClick, children, ...props}) => (
  <ConfirmationModal
    title={confirmationTitle}
    text={confirmationText}
  >
    {(confirm) => (
      <Button onClick={confirm(onClick)} {...props}>
        {children}
      </Button>
    )}
  </ConfirmationModal>
)
