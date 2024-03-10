import { useState, useEffect } from "react"
import { ArrowLeft } from "./icons/ArrowLeft"
import { OptionsIcon, CallIcon, ImagesIcon, SendIcon } from "./icons/Options"
import { io } from 'socket.io-client'

export function Chat() {
    const [messages, setMessages] = useState([])
    
    const socket = io('http://localhost:4000', {
        auth: {
            serverOffset: 0
        }
    })

    useEffect(() => {
        socket.on('chat message', (msg, serverOffset) => {
            setMessages(prevMessages => {
                if (!prevMessages.some(message => message.id === serverOffset)) {
                    return [...prevMessages, { content: msg, id: serverOffset }]
                }
                return prevMessages
            });
        })

        return () => {
            socket.disconnect()
        }

    }, [])
    
    const renderMessages = () => {
        return messages.map((message) => (
            <div key={message.id} className="flex items-center gap-x-5 py-1">
                <img src="/img/userDefect.png" className="size-7 rounded-full"/>
                <li>{message.content}</li>
            </div>
        ))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const message = e.target.Message.value

        if(message) {
            socket.emit("chat message", message)
            e.target.reset()
        }
    }

    const classButton = `inline-flex items-center justify-center gap-2 px-3 py-2 space-x-2 text-base text-white transition bg-gray-800/70 border border-gray-600 focus-visible:ring-yellow-500/80 text-md hover:bg-gray-800 hover:border-gray-900 group  rounded-xl hover:text-white focus:outline-none focus-visible:outline-none focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-2 active:bg-black
    md:w-20`

    return (
        <div className="w-full md:w-[500px] border border-gray-200 h-full rounded relative">
            <div className="absolute inset-0 bg-chat-background bg-cover bg-center opacity-40" />

            <section>
                <header className="flex justify-between bg-black w-full">  
                    <div className="flex items-center justify-center gap-x-4 px-2">
                        <ArrowLeft width="30" height="30" />
                        <img src="https://www.fayerwayer.com/resizer/Dq_YoEDDqPPuPa7ngsqi_ZyeJCA=/800x0/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/metroworldnews/DZHH4EQ7TFFZ3EQ7BGKTWVLOMU.jpg" className="size-10 rounded-full" />
                        <h1 className="font-bold text-xl"> +52 776 102 9302 </h1>
                    </div>
                    
                    <div className="flex justify-center items-center gap-x-4">
                        <CallIcon width="20" height="20" />
                        <OptionsIcon width="25" height="25" />
                    </div>
                </header>

                <main className="h-[500px] overflow-y-auto p-4">
                    <ul>
                        {renderMessages()}
                    </ul>
                </main>
                <form className="absolute bottom-0 left-0 right-0 flex w-full items-center justify-between bg-black/40 rounded" onSubmit={handleSubmit}>
                    <div className="flex gap-x-4">
                        <img src="https://i.pinimg.com/736x/cb/16/ea/cb16ea66becc75dba10ece8aea096c08.jpg" className="size-10 rounded-full border border-green-600" />
                        <input type="text" name="Message" placeholder="  Mensaje.." required className="rounded-full w-[200px] md:w-[300px] focus:outline-none" />
                    </div>

                    <div className="flex items-center gap-x-5">
                        <label className="transition cursor-pointer md:hover:scale-105">
                            <ImagesIcon width="25" height="25" />
                            <input type="file" name="Image" className="hidden" autoComplete="off" />
                        </label>
                        <button type="submit" value="Send" className={classButton}>
                             <SendIcon width="25" height="25" />
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}