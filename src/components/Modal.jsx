// components/Modal.jsx
import * as Dialog from "@radix-ui/react-dialog";
import "../styles/Modal.css";

function Modal({ open, onClose, title, children, description, width = "400px" }) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content 
          className="modal-content" 
          style={{ 
            width, 
            maxWidth: '95vw',  // Add maxWidth to ensure it doesn't exceed viewport
            margin: '1rem'     // Add some margin for better mobile display
          }}
        >
          {title && <Dialog.Title className="modal-title">{title}</Dialog.Title>}
          {description && <Dialog.Description className="modal-description">{description}</Dialog.Description>}
          <div className="modal-body">{children}</div>
          <Dialog.Close className="close-btn">✕</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
