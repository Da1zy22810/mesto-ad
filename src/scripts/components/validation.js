const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.hasAttribute('data-error-message')) {
    const value = inputElement.value;
    const isEmpty = value.trim() === '';
    const regex = /^[a-zA-Zа-яА-ЯёЁ \-]+$/;

    if (isEmpty) {
      showInputError(formElement, inputElement, 'Обязательное поле', settings);
      return;
    }

    const minLength = 2;
    const maxLength = inputElement.classList.contains('popup__input_type_name') ? 40 : 30;
    if (value.length < minLength || value.length > maxLength) {
      const message = `Должно быть от ${minLength} до ${maxLength} символов`;
      showInputError(formElement, inputElement, message, settings);
      return;
    }

    if (!regex.test(value)) {
      showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
      return;
    }
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    return;
  }

  hideInputError(formElement, inputElement, settings);
};

const hasInvalidInput = (inputList, settings) => {
  return inputList.some(inputElement =>
    inputElement.classList.contains(settings.inputErrorClass)
  );
};

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList, settings)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  if (inputList.length === 0) {
    if (buttonElement) {
      enableSubmitButton(buttonElement, settings);
    }
    return;
  }

  disableSubmitButton(buttonElement, settings);

  inputList.forEach(inputElement => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));

  formList.forEach(formElement => {
    const hasInputs = formElement.querySelector(settings.inputSelector);
    if (!hasInputs) {
      return;
    }

    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });

    setEventListeners(formElement, settings);
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  if (inputList.length === 0) {
    return;
  }

  inputList.forEach(inputElement => {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
};
