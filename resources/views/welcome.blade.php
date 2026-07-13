<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Sistem Pengarsipan Buku Perpustakaan</title>
        <link rel="icon" type="image/x-icon" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="font-sans antialiased bg-gray-50 text-gray-900">
        <div id="app"></div>
    </body>
</html>
