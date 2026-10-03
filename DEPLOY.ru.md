# Публикация

## Локальный просмотр
Анимации грузятся из `assets/lottie/preview.dat`, а браузер блокирует это при открытии через `file://`.
Запусти локальный сервер в папке репозитория и открой http://localhost:8000:

    python3 -m http.server 8000

## Выкладка
GitHub Pages показывает ветку `main`. Слей pull request в `main`, и через минуту-две
сайт обновится на https://zeltrium.com.

## Письмо с бесплатным паком (MailerLite)
- Форма `free-form` в `index.html` отправляет почту в форму MailerLite 200318522151143170.
- Double opt-in включён в MailerLite. В приветственной автоматизации ссылка на
  https://zeltrium.com/downloads/zeltrium-free-5.zip
- Старый `downloads/ui-microinteractions-free-pack.zip` оставлен, чтобы ссылки в уже
  отправленных письмах работали. Удали его через месяц-два.

## Замена анимаций
Замени файл в паке и пересобери `assets/lottie/preview.dat`
(перекрашено в цвета бренда, закодировано XOR-ключом из script.js и base64).
