import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { socketService } from '../services/socketService';
import { toast } from 'react-toastify';

export const useSocket = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            console.log('Initialisation Socket pour user:', user.id);
            socketService.connect(user.id);

            socketService.onNewMessage((message) => {
                const senderName = `${message.sender.first_name} ${message.sender.last_name}`;

                if (window.location.pathname !== '/messages') {
                    toast.info(`Nouveau message de ${senderName}`);
                }

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`Nouveau message de ${senderName}`, {
                        body: message.content.length > 100 ?
                              message.content.substring(0, 100) + '...' :
                              message.content,
                        icon: '/logo.png'
                    });
                }
            });

            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }

        return () => {
            socketService.offNewMessage();
            socketService.disconnect();
        };
    }, [user?.id]);

    return {
        isConnected: socketService.isConnected()
    };
};