<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $book;

    public function __construct($book)
    {
        $this->book = $book;
    }

    public function broadcastOn(): array
    {
        return [new Channel('library-channel')];
    }

    public function broadcastAs(): string
    {
        return 'BookUpdated';
    }
}
