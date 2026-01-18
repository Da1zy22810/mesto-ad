/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что-то экспортировать
*/

// Импорты API
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  updateUserAvatar,
  addNewCard,
  deleteCard as deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";

// Импорты компонентов
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const addCardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoList = infoModalWindow.querySelector(".popup__info");
const infoUsersList = infoModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

// Глобальная переменная для хранения ID текущего пользователя
let currentUserId = null;

// Обработчики
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const renderLoading = (button, isLoading) => {
  const defaultText = button.textContent;
  button.textContent = isLoading ? "Сохранение..." : defaultText;
  button.disabled = isLoading;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true);

  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка обновления аватара:", err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(addCardSubmitButton, true);

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCardData) => {
      const newCardElement = createCardElement(newCardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCardClick,
        onInfoClick: handleInfoClick,
        userId: currentUserId,
      });
      placesWrap.prepend(newCardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.error("Ошибка добавления карточки:", err);
    })
    .finally(() => {
      renderLoading(addCardSubmitButton, false);
    });
};

// Обработчик лайка
const handleLikeCard = (cardId, likeButton, likeCountElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeCountElement.textContent = updatedCard.likes.length;
      likeButton.classList.toggle("card__like-button_is-active", !isLiked);
    })
    .catch((err) => {
      console.error("Ошибка при изменении лайка:", err);
    });
};

// Обработчик удаления (с подтверждением)
let cardToDelete = null;
let cardElementToDelete = null;

const handleDeleteCardClick = (cardId, cardElement) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardConfirm = (evt) => {
  evt.preventDefault();
  deleteCardFromServer(cardToDelete)
    .then(() => {
      cardElementToDelete.remove();
      closeModalWindow(removeCardModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка удаления карточки:", err);
    });
};

// Обработчик статистики карточки
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (label, value) => {
  const template = document.getElementById("popup-info-definition-template").content.cloneNode(true);
  template.querySelector(".popup__info-term").textContent = label;
  template.querySelector(".popup__info-description").textContent = value;
  return template;
};

const createUserPreview = (user) => {
  const template = document.getElementById("popup-info-user-preview-template").content.cloneNode(true);
  template.querySelector(".popup-info__user-avatar").src = user.avatar;
  template.querySelector(".popup-info__user-avatar").alt = user.name;
  template.querySelector(".popup-info__user-name").textContent = user.name;
  return template;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) throw new Error("Карточка не найдена");

      infoList.innerHTML = "";
      infoUsersList.innerHTML = "";

      infoList.append(createInfoString("Дата создания:", formatDate(cardData.createdAt)));

      infoList.append(createInfoString("Автор:", cardData.owner.name));

      const likesTitle = document.createElement("li");
      likesTitle.className = "popup__info-item";
      likesTitle.innerHTML = `<dt class="popup__info-term">Лайки (${cardData.likes.length}):</dt>`;
      infoList.append(likesTitle);

      // Список пользователей
      cardData.likes.forEach((user) => {
        infoUsersList.append(createUserPreview(user));
      });

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка загрузки информации о карточке:", err);
    });
};

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Включение валидации
enableValidation(validationSettings);

// Слушатели отправки форм
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardConfirm);

// Открытие попапов
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

// Закрытие модалок
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Загрузка данных с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      const cardElement = createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCardClick,
        onInfoClick: handleInfoClick,
        userId: currentUserId,
      });
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });
