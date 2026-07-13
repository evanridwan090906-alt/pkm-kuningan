<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnDateUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $transaction;
    public $message;

    public function __construct($transaction, $message = 'Tanggal pengembalian diperbarui')
    {
        $this->transaction = $transaction;
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('library-channel'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ReturnDateUpdated';
    }
}
