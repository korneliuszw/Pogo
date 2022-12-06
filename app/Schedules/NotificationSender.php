<?php

namespace App\Schedules;

use App\Models\Notification;
use App\Models\User;
use ErrorException;
use Illuminate\Support\Carbon;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;

class NotificationSender {
    private WebPush $push;

    public function __construct() {
        $this->push = new WebPush([
            'VAPID' => [
                'subject' => 'jesetag321@cosaxu.com',
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
            dump($notification);
            $subscription = Subscription::create([
                'endpoint' => $notification->endpoint,
                'contentEncoding' => 'aesgcm',
                'publicKey' => $notification->p256dh,
                'authToken' => $notification->auth,
                'keys' =>  [
                    'auth' => $notification->auth,
                    'p256dh' => $notification->p256dh
                ]
            ]);
            $users = $notification->belongsTo(User::class, 'user_id')->get();
            foreach ($users as $user) {
                dump($user);
                foreach ($user->tasks()->incomplete()->where('scheduled_at', '<=', "datetime('now')")->where('notification_sent', false)->get() as $task) {
                    dump($task);
                    $task_short = substr($task->task, 0, 50);
                    $this->push->queueNotification($subscription, json_encode([
                        "msg_up" => "Przypomnienie",
                        "msg_down" => "Zadanie $task_short zostalo rozpoczete",
                        "timestamp" => $task->scheduled_at
                    ]));
                    $task->update(['notification_sent' => true]);
                }
            }
        }
        foreach ($this->push->flush() as $p) {
            // let generator go
        }
    }
}
?>