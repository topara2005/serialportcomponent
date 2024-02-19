import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Serial } from './serial';
import {
  serial as polyfill,
  SerialPort,
  SerialPort as SerialPortPolyfill,
} from 'web-serial-polyfill';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<h1>Test para {{ name }}!</h1>
  <div>
  <select id="ports"
  [(ngModel)]="selectedPort"
  
  >
  
    <option disabled>Click 'Agregar'...</option>
    <option *ngFor="let port of serialPorts; let i = index" [value]="port" >
      {{port.text}}</option>
  </select>
  <button id="connect" (click)="getSelectedPort()"  >Agregar</button>
  </div>

  <div>
    <button type="button" (click)="connect()">Conectar 1</button>
  </div>
  <div>
    <button type="button" (click)="connect2()">Conectar 2</button>
  </div>
  <div>
    <button type="button" (click)="close()">Desconectar 1</button>
  </div>
  <div>
    <button type="button" (click)="close2 ()">Desconectar 2</button>
  </div>
  `,
})
export class App implements AfterViewInit {
  portCounter: number = 1;
  @ViewChild('ports') portSelector: ElementRef<HTMLSelectElement> | undefined;
  serialPorts: PortOption[] = [];
  selectedPort: PortOption | undefined;
  connectButton: HTMLButtonElement | undefined;
  serial: Serial;
  serial2: Serial;
  port: any;
  port2: any;
  name = 'Bascula';
  constructor() {
    this.serial = new Serial(this.dataHandler);
    this.serial2 = new Serial(this.dataHandler2);
  }
  async ngAfterViewInit() {
    // ElementRef { nativeElement: <input> }
    console.log(this.portSelector!);
    if ('serial' in navigator) {
      console.log('serial');
      // The Web Serial API is supported by the browser.
      let nav: any = navigator;
      //  const ports = await nav.serial.getPorts();
      // ports.forEach((port: any) => this.addNewPort(port));
    }
  }
  addNewPort(port: SerialPort | SerialPortPolyfill): PortOption | undefined {
    try {
      this.serialPorts.push({
        text: `Bascula ${this.portCounter++}`,
        port: port,
        selected: false,
        info: port.getInfo(),
      });

      console.log('new port created ' + JSON.stringify(port.getInfo()));
      this.selectedPort = this.serialPorts[this.serialPorts.length - 1];
      console.log('new port created ' + this.selectedPort.info);
      return this.selectedPort;
    } catch (e) {
      console.log(e);
    }

    return undefined;
  }

  maybeAddNewPort(port: SerialPort | SerialPortPolyfill): PortOption {
    const portOption = this.findPortOption(port);
    if (portOption) {
      console.log('encontrado');
      return portOption;
    }
    return this.addNewPort(port)!;
  }
  findPortOption(port: SerialPort | SerialPortPolyfill): PortOption | null {
    for (let i = 0; i < this.serialPorts.length; ++i) {
      const option = this.serialPorts[i];
      const portOption = option as PortOption;
      if (portOption.port === port) {
        return portOption;
      }
    }

    return null;
  }

  dataHandler(data: string) {
    console.log('Bascula1 -> ' + data);
  }
  dataHandler2(data: string) {
    console.log('Bascula2 -> ' + data);
  }
  connect() {
    if (!this.port) {
      this.serial.connect((port: any) => {
        debugger;
        this.port = port;
        console.log(JSON.stringify(this.port.getInfo()));
      });
    }
  }
  connect2() {
    if (!this.port2) {
      this.serial2.connect((port: any) => {
        debugger;
        this.port2 = port;
        console.log(JSON.stringify(this.port2.getInfo()));
      });
    }
  }
  close() {
    if (this.port)
      this.serial.close((port: any) => {
        this.port = port;
      });
  }
  close2() {
    if (this.port2)
      this.serial2.close((port: any) => {
        this.port2 = port;
      });
  }

  async getSelectedPort(): Promise<void> {
    let port1: any;
    if (
      this.portSelector?.nativeElement.value == 'prompt' ||
      !this.portSelector?.nativeElement.value
    ) {
      try {
        let nav: any = navigator;
        port1 = await nav.serial.requestPort();
        console.log('llamando add new port');
        const portOption = this.maybeAddNewPort(port1);
        portOption.selected = true;
      } catch (e) {
        return;
      }
    } else {
      console.log('prompt2');
      /*const selectedOption = this.portSelector?.nativeElement
        .selectedOptions[0] as PortOption;
      port1 = selectedOption.port;*/
    }
  }
}

export interface PortOption {
  port: SerialPort | SerialPortPolyfill;
  text: string;
  selected: boolean;
  info?: { usbVendorId: number };
}

bootstrapApplication(App);
