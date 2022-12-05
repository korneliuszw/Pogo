<?php

namespace App\Schedules;

use App\Models\Notification;
use App\Models\User;
use ErrorException;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;

class NotificationSender {
    private WebPush $push;

    public function __construct() {
        $this->push = new WebPush([
            'VAPID' => [
                'subject' => env('APP_URL'),
                'publicKey' => env('NOTIFICATION_PUBLIC_KEY'),
                'privateKey' => env('NOTIFICATION_PRIVATE_KEY')
            ]
        ], [
            'TTL' => 600,
            'urgency' => 'high',
        ]);
    }

    public function invoke() {
        $notifications = Notification::all();
        foreach ($notifications as $notification) {
            $subscription = Subscription::create([
                'endpoint' => $notification->endpoint,
                'publicKey' => env("NOTIFICATION_PUBLIC_KEY"),
                'authToken' => $notification->auth
            ]);
            $users = $notification->belongsTo(User::class, 'user_id')->get();
            foreach ($users as $user) {
                foreach ($user->tasks()->get() as $task) {
                    $this->push->queueNotification($subscription, json_encode([
                        "msg_up" => "Przypomnienie",
                        "msg_down" => "Zadanie {$task->$task} zostalo rozpoczete",
                        "timestamp" => $task->scheduled_at
                    ]));
                }
            }
            $this->push->flush();
        }
    }
}
?>