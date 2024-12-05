import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {
  private hubConnection!: signalR.HubConnection;
  private notificationsSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
 
  constructor() { }

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7009/notificationHub`,{
          accessTokenFactory:()=>localStorage.getItem('jwtToken')||'',
        }) // Update with your API URL
        .configureLogging(signalR.LogLevel.Debug)
        .withAutomaticReconnect()
        .build();

        this.hubConnection
            .start()
            .then(() => console.log('SignalR Connected'))
            .catch((err) => 
              {console.error('Error connecting to SignalR:', err)
          if(err instanceof Error){
            console.error('error message:',err.message);
          }
          });

        this.hubConnection.on('ReceiveNotification', (message: string) => {
            this.addNotification(message);
        });
}
private addNotification(message: string) {
 
  const currentNotifications = this.notificationsSubject.value;
  this.notificationsSubject.next([message, ...currentNotifications]);
}
stopConnection() {
  if (this.hubConnection) {
      this.hubConnection.stop();
  }
}
}
