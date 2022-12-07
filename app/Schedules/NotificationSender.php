<?php

namespace App\Schedules;

use App\Models\Notification;
use App\Models\User;
use ErrorException;
use Illuminate\Support\Carbon;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class NotificationSender {
    private WebPush $push;
    private int $maxBatchSize = 600;
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
            'batchSize' => $this->maxBatchSize
        ]);
        // firefox mobile supports up to 2048 bytes per payload
        $this->push->setAutomaticPadding(2048);
    }
    private function flush() {
        foreach ($this->push->flush() as $p) {
            // let go
        }
    }
    public function invoke() {
        $notify = DB::table('notifications')
            ->join('tasks', 'notifications.user_id', '=', 'tasks.user_id')
            ->whereRaw('tasks.scheduled_at <= CURRENT_TIMESTAMP')
            ->where('notification_sent' ,false)
            ->select('tasks.id', 'tasks.task', 'notifications.endpoint',
                'notifications.p256dh', 'notifications.auth', 'tasks.scheduled_at')
            ->get();
        $idx = 0;
        dump($notify);
        foreach($notify as $notification) {
            if ($idx >= $this->maxBatchSize)
                $this->flush();
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
            $task_short = substr($notification->task, 0, 50);
            $this->push->queueNotification($subscription, $task_short);
            DB::table('tasks')
                ->where('id', $notification->id)
                ->update(['notification_sent' => true]);
            $idx+=1;
        }
        $this->flush();
    }

    // public function invoke() {
    //     $notifications = Notification::all();
    //     foreach ($notifications as $notification) {
    //         $subscription = Subscription::create([
    //             'endpoint' => $notification->endpoint,
    //             'contentEncoding' => 'aesgcm',
    //             'publicKey' => $notification->p256dh,
    //             'authToken' => $notification->auth,
    //             'keys' =>  [
    //                 'auth' => $notification->auth,
    //                 'p256dh' => $notification->p256dh
    //             ]
    //         ]);
    //         $users = $notification->belongsTo(User::class, 'user_id')->get();
    //         foreach ($users as $user) {
    //             foreach ($user->tasks()->incomplete()->whereRaw('scheduled_at <= CURRENT_TIMESTAMP')->where('notification_sent', false)->get() as $task) {
    //                 $task_short = substr($task->task, 0, 50);
    //                 $this->push->queueNotification($subscription, json_encode([
    //                     "msg_up" => "Przypomnienie",
    //                     "msg_down" => "Zadanie $task_short zostalo rozpoczete",
    //                     "timestamp" => $task->scheduled_at
    //                 ]));
    //                 $task->update(['notification_sent' => true]);
    //             }
    //         }
    //     }
    //     foreach ($this->push->flush() as $p) {
    //         // let generator go
    //     }
    // }
}
?>