<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $showCompleted = $request->query('showCompleted', false);
        $tasks = Task::select('task', 'created_at', 'updated_at', 'id', 'scheduled_at', 'completed_at')
            ->with('user:id');
        // get database type
        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        // sqlite handles date diff differently
        if ($driver == 'sqlite')
            $tasks = $tasks->orderBy(DB::raw("JULIANDAY(tasks.scheduled_at) - JULIANDAY(datetime('now'))"), "ASC");
        else
            $tasks = $tasks->orderBy(DB::raw("tasks.scheduled_at - CURRENT_TIMESTAMP"));
        if (!$showCompleted) {
            $tasks = $tasks->incomplete();
        }
        return Inertia::render('Tasks/Hello', [
            'createdTasks' => $tasks->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'task' => 'required|string',
            'scheduled_at' => 'required|date'
        ]);
        $request->user()->tasks()->create($validated);
        return redirect(route('tasks.index'));
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $validated = $request->validate([
            'task' => 'required|string',
            'scheduled_at' => 'required|date'
        ]);
        $task->update($validated);
        return redirect(route('tasks.index'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return redirect(route('tasks.index'));
    }
    public function toggle(Task $task)
    {
        $this->authorize('update', $task);
        $task->update(['completed_at' => $task->isCompleted() ? null: now()]); 
    }
}
