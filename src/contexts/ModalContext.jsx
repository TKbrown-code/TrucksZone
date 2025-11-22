// src/context/ModalContext.jsx
import { createContext, useState, useContext } from "react";
import Modal from "../components/Modal";
const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: "",
    content: null,
    width: "400px",
  });

  const showModal = ({ title, content, width }) => {
    setModalData({
      isOpen: true,
      title,
      content,
      width: width || "400px",
    });
  };

  const hideModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        open={modalData.isOpen}
        onClose={hideModal}
        title={modalData.title}
        width={modalData.width}
      >
        {modalData.content}
      </Modal>
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
