<?php

use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\Notification;

class NotificationSender {
    private WebPush $push;

    public function __constructor() {
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

    public function run() {
        // TODO: Query notifications first
        $tasks = Task::where('scheduled_at', '>=', now())->where('completed_at', null)->get();
        foreach ($tasks as $task) {
            $notification = $task->user()->notification();
            if (!$notification) continue;
            $push->queueNotification($notification->endpoint, [
                "msg_up" => "Przypomnienie",
                "msg_down" => "Zadanie {$task->$task} zostalo rozpoczete",
                "timestamp" => $task->scheduled_at->getTimestamp()
            ]);
        }
        $push->flush();
    }
}
?>