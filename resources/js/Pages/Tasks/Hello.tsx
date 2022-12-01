import { Inertia } from '@inertiajs/inertia';
import { Head, useForm } from '@inertiajs/inertia-react';
import React from 'react'
import { ChangeEvent } from 'react';
import { FormEvent } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
export default function Hello({auth, createdTasks}) {
    const { post, reset, setData } = useForm({ task: '' })
    const onChangeTask = (event: ChangeEvent<HTMLInputElement>) => setData('task', event.target.value);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('tasks.store'), { onSuccess: () => {
            reset()
            Inertia.get('tasks', {}, {
                onBefore: () => console.log('start'),
                onFinish: () => console.log('finish')
                onError: (err) => console.error(err)
            })
        }})
    }
    return (
        <AuthenticatedLayout auth={auth} header={<Head title="Tasks"/>}>
            <div className="flex min-h-full items-center justify-center flex-col">
               <form className="mt-8 flex gap-5" onSubmit={submit}>
                    <input onChange={onChangeTask} id="task-name" className="appearance-none border-gray-300 text-gray-900" type="text"/>
                    <button type="submit" className="py-3 px-5 group justify-center rounded-md border border-transparent bg-teal-500 text-sm text-white hover:bg-teal-600 focus:outline-none">Dodaj</button>
               </form>
               <div className="list flex flex-col gap-10">
                    {createdTasks.map(({task}) => (
                        <div className=''>
                            {task}
                        </div>
                    ))}
               </div>
               
            </div>
        </AuthenticatedLayout>
    )
}