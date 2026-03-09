// Показывает ошибку валидации
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

// Скрывает ошибку валидации
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';
};

// Проверяет, состоит ли строка только из пробелов
const isEmptyString = (str) => {
  return str.trim() === '';
};

// Проверяет валидность поля с учетом trim() для всей строки
const checkInputValidity = (formElement, inputElement, settings) => {
  const value = inputElement.value;
  const trimmedValue = value.trim();
  
  // Проверка на пустую строку или строку из пробелов для текстовых полей
  if (inputElement.type === 'text' && isEmptyString(value)) {
    inputElement.setCustomValidity('Это поле обязательно к заполнению');
  } 
  // Проверка на несоответствие паттерну - применяем к обрезанной строке
  else if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage || '');
  }
  // Проверка минимальной длины для обрезанной строки
  else if (inputElement.type === 'text' && inputElement.minLength && trimmedValue.length < inputElement.minLength) {
    inputElement.setCustomValidity(`Минимальная длина ${inputElement.minLength} символа`);
  }
  // Проверка на URL (для полей с типом url)
  else if (inputElement.type === 'url' && isEmptyString(value)) {
    inputElement.setCustomValidity('Это поле обязательно к заполнению');
  }
  else {
    inputElement.setCustomValidity('');
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

// Проверяет, есть ли хотя бы одно невалидное поле (с учетом trim() для всей строки)
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    const value = inputElement.value;
    const trimmedValue = value.trim();
    
    // Для текстовых полей проверяем trim()
    if (inputElement.type === 'text') {
      // Проверка на пустую строку
      if (isEmptyString(value)) {
        return true;
      }
      // Проверка минимальной длины для обрезанной строки
      if (inputElement.minLength && trimmedValue.length < inputElement.minLength) {
        return true;
      }
      // Проверка паттерна на обрезанной строке
      if (inputElement.pattern) {
        const pattern = new RegExp(inputElement.pattern);
        if (!pattern.test(trimmedValue)) {
          return true;
        }
      }
    }
    
    // Для URL полей
    if (inputElement.type === 'url' && isEmptyString(value)) {
      return true;
    }
    
    return !inputElement.validity.valid;
  });
};

// Делает кнопку неактивной
const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

// Делает кнопку активной
const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Переключает состояние кнопки в зависимости от валидности полей
const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

// Устанавливает слушатели событий для формы
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  
  toggleButtonState(inputList, buttonElement, settings);
  
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

// Очищает ошибки валидации и делает кнопку неактивной
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
    inputElement.setCustomValidity('');
  });
  
  disableSubmitButton(buttonElement, settings);
};

// Включает валидацию для всех форм
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  
  formList.forEach((formElement) => {
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });
    
    setEventListeners(formElement, settings);
  });
};