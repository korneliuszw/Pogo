import { useForm, Link } from '@inertiajs/inertia-react';
import React from 'react'
import { useCallback, useState, useEffect } from 'react';
import { Button, DangerButton } from '@/Components/atoms/Button';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Checkbox from '@/Components/Checkbox'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import FormInput from '@/Components/molecules/FormInput';
import ReactDatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css'
import { Inertia } from '@inertiajs/inertia';
import { useSubscribe } from './Subscribe';

dayjs.locale('pl')

export default function Hello({auth, createdTasks}) {
    const [editing, setIsEditing] = useState(false)
    const { reset, post, setData, patch} = useForm({ task: '' })
    const onSuccess = useCallback(() => {
        reset()
    }, [reset])
    const updateForm = (e) => {
        e.preventDefault()
        if (editing === true)
            post(route('tasks.store'), { onSuccess: onSuccess})
        else
            patch(route('tasks.update', editing.id), { onSuccess: onSuccess })
        setIsEditing(false)
    }

    const setDate = (d) => {
        setData('scheduled_at', d)
        setSelectedDate(d)
    }

    const [selectedDate, setSelectedDate] = useState();

    const toggle = (id) => {
        console.log('toggle')
        post(route('tasks.toggle', id));
    }
    const [showCompleted, setShowCompleted] = useState(false)
    const toggleCompleted = () => {
        Inertia.visit(route('tasks.index', {
            showCompleted: !showCompleted
        }), {
            preserveState: true
        })
        setShowCompleted(!showCompleted)
    }

    useEffect(() => {
        if (editing === true) {
            setSelectedDate(new Date())
            setData('scheduled_at', new Date());
        } else if (editing !== false) {
            setSelectedDate(dayjs(editing.scheduled_at).toDate())
            setData('task', editing.task)
        }
    }, [editing])

    const { askPermission } = useSubscribe()

    return (
        <AuthenticatedLayout auth={auth} header=
        {<>
            <Checkbox name="toggle-completed" value={showCompleted} handleChange={toggleCompleted}/>
            <Button onClick={() => setIsEditing(true)}>Dodaj</Button>
            <Button onClick={askPermission}>Wlacz powiadomienia</Button>
        </>
        }>
            <Modal closeable onClose={() => setIsEditing(false)} show={editing !== false}>
                <form onSubmit={updateForm} className="flex flex-col gap-3 p-10">
                    <FormInput dataName="task" setData={setData} label="Zadanie" defaultValue={editing.task}/>
                    <InputLabel>Czas rozpoczecia</InputLabel>
                    <ReactDatePicker selected={selectedDate} onChange={setDate} showTimeInput inline/>
                    <Button submit className={'mt-10'}>{editing === true ? "Dodaj" : "Zapisz"}</Button>
                </form>
            </Modal>
            <div className="flex min-h-full items-center justify-center flex-col pt-3">
               <div className="list flex flex-col gap-10">
                    {createdTasks.map((task) => (
                        <div key={`task-${task.id}`}
                            className="flex gap-10 items-center justify-center my-4"
                            >
                            <div className="text-md font-medium text-gray-500 w-80 justify-center text-center shadow-md self-stretch flex flex-col items-center">
                                <div className={`capitalize font-semibold text-teal-600 ${task.completed_at ? 'line-through' : ''}`} onClick={() => toggle(task.id)}>{task.task}</div>
                                <div className=''>
                                    {task.completed_at ? 
                                        (<div>Wykonano: <span>{dayjs(task.completed_at).format('H:mm D MMMM YYYY')}</span></div>)
                                        : (<div>Zaplanowano na: <span>{dayjs(task.scheduled_at).format('H:mm D MMMM YYYY')}</span></div>)
                                    }
                                    <div className="text-sm font-light">
                                        Utworzono: <span>{dayjs(task.created_at).format("H:mm D MMMM YYYY")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-20 flex flex-col gap-1">
                                <Button onClick={() => setIsEditing(task)}>Edytuj</Button>
                                <Link as="div" href={route('tasks.destroy', task.id)} method="delete"><DangerButton>Usuń</DangerButton></Link>
                            </div>
                        </div>
                    ))}
               </div>
               
            </div>
        </AuthenticatedLayout>
    )
}