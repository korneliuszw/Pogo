import { Head, useForm, Link } from '@inertiajs/inertia-react';
import React from 'react'
import { useCallback, useState } from 'react';
import { Button, DangerButton } from '../../Components/atoms/Button';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
export default function Hello({auth, createdTasks}) {
    const [isEditing, setIsEditing] = useState(false)
    const { reset, post, setData, } = useForm({ task: '' })
    const onChangeTask = (event) => setData('task', event.target.value);
    const onSuccess = useCallback(() => {
        reset()
    }, [reset])
    const submit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), { onSuccess: onSuccess})
    }
    return (
        <AuthenticatedLayout auth={auth} header={<Head title="Tasks"/>}>
            <div className="flex min-h-full items-center justify-center flex-col">
               <form className="mt-8 flex gap-5" onSubmit={submit}>
                    <input onChange={onChangeTask} id="task-name" className="appearance-none border-gray-300 text-gray-900" type="text"/>
                    <Button submit>Dodaj</Button>
               </form>
               <div className="list flex flex-col gap-10">
                    {createdTasks.map(({task, id}) => (
                        <div key={`task-${id}`} className="flex gap-10 items-center justify-center my-4">
                            <div className="text-md font-medium text-teal-300 w-80 justify-center text-center bg-lime-300 h-100">
                                <div className="">{task}</div>
                            </div>
                            <div className="w-20 flex flex-col gap-1">
                                <Button onClick={() => setIsEditing(true)} >Edytuj</Button>
                                <Link as="div" href={route('tasks.destroy', id)} method="delete"><DangerButton>Usuń</DangerButton></Link>
                                
                            </div>
                        </div>
                    ))}
               </div>
               
            </div>
        </AuthenticatedLayout>
    )
}