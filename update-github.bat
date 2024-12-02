@echo off
setlocal EnableDelayedExpansion

echo ===================================
echo    GitHub Автоматическое обновление
echo ===================================

:: Проверка подключения к интернету
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo Ошибка: Нет подключения к GitHub
    pause
    exit /b 1
)

echo.
echo Проверка статуса изменений:
git status
git diff --quiet
if errorlevel 1 (
    echo.
    echo Обнаружены изменения в файлах.
) else (
    echo.
    echo Изменений не обнаружено. Нечего обновлять.
    pause
    exit /b 0
)

echo.
set /p "continue=Продолжить обновление? (y/n): "
if /i not "!continue!"=="y" (
    echo Операция отменена пользователем
    pause
    exit /b 0
)

echo.
set /p "commit_msg=Введите сообщение коммита (или нажмите Enter для стандартного): "
if "!commit_msg!"=="" set "commit_msg=Автоматическое обновление сайта"

echo.
echo Добавление изменений...
git add .
if errorlevel 1 (
    echo Ошибка при добавлении файлов
    pause
    exit /b 1
)

echo.
echo Создание коммита...
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo Ошибка при создании коммита
    pause
    exit /b 1
)

echo.
echo Отправка изменений на GitHub...
git push
if errorlevel 1 (
    echo Ошибка при отправке на GitHub
    echo Попробуйте выполнить pull перед push:
    echo git pull origin main
    pause
    exit /b 1
)

echo.
echo ===================================
echo    Обновление успешно завершено
echo ===================================
pause
