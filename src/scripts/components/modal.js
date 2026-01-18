const handleEscUp = (evt) => {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

document.addEventListener("keydown", handleEscUp);

export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add("popup_is-opened");
  document.body.classList.add("body_no-scroll");
};

export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove("popup_is-opened");
  document.body.classList.remove("body_no-scroll");
};

export const setCloseModalWindowEventListeners = (modalWindow) => {
  const closeButton = modalWindow.querySelector(".popup__close");
  
  const closeByButton = () => closeModalWindow(modalWindow);
  const closeByOverlay = (evt) => {
    if (evt.target === modalWindow) {
      closeModalWindow(modalWindow);
    }
  };

  closeButton.addEventListener("click", closeByButton);
  modalWindow.addEventListener("click", closeByOverlay);

  modalWindow._closeHandlers = { closeByButton, closeByOverlay };
};
