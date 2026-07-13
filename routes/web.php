<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
