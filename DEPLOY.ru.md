# Публикация

## Локальный просмотр
Анимации грузятся из `assets/lottie/*.dat`, а браузер блокирует это при открытии через `file://`.
Запусти локальный сервер в папке репозитория и открой http://localhost:8000:

    python3 -m http.server 8000

GoatCounter не считает localhost, поэтому локальные просмотры в статистику не попадают.

## Выкладка
GitHub Pages показывает ветку `main`. Изменения идут через pull request, мержит Роман,
и через минуту-две сайт обновится на https://zeltrium.com.

## Бесплатные паки (MailerLite)
Обе формы отправляют почту в MailerLite; сайт отдаёт архив сразу после отправки формы.
Стандартное письмо подтверждения MailerLite (на бесплатном тарифе не редактируется)
подтверждает адрес, потом автоматизация шлёт письмо с паком от hello@zeltrium.com
(открытия не отслеживаем).

| Пак | Форма в `packs.html` | Форма MailerLite → группа | Автоматизация | Исходник письма | Архив |
|---|---|---|---|---|---|
| Free 5 | `free-form` → 200318522151143170 | Zeltrium free pack | Zeltrium free pack | `email/free-5-delivery.html` | `downloads/zeltrium-free-5.zip` |
| AI states | `ai-form` → 202105914383140548 | AI states free | Zeltrium AI states | `email/ai-states-delivery.html` | `downloads/zeltrium-ai-states-free.zip` |

Старый `downloads/ui-microinteractions-free-pack.zip` оставлен, чтобы ссылки в уже
отправленных письмах работали.

## Аналитика (GoatCounter)
`assets/js/goatcounter-count.js` подключён на всех страницах и шлёт данные в
https://zeltrium.goatcounter.com. Клики считаются по `data-goatcounter-click`
(скачивания, Gumroad, бриф, Start a project, Behance, паки); `script.js` добавляет `free-signup` / `ai-signup`.
Если меняешь, что собирается, обнови раздел 4 в `privacy.html`.

## Замена анимаций
Замени файл в паке и пересобери `assets/lottie/preview.dat` (или `ai.dat` для AI-состояний):
перекрашено в цвета бренда, закодировано XOR-ключом из script.js и base64.
Сегменты играются через enterFrame и заканчиваются `goToAndStop` точно на кадре маркера:
`playSegments` в lottie останавливается на кадр раньше.
