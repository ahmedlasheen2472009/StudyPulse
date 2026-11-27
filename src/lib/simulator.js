/**
 * Realistic BLE Packet Simulator for Demo Mode
 * Contract: "bpm,hrv,gsr,motion,quality"
 */

import { formatBlePacket } from './packetParser.js';

export class PacketSimulator {
  constructor(onPacket) {
    this.onPacket = onPacket;
    this.timer = null;
    this.forcedState = null; // null | 'calm' | 'medium' | 'high' | 'motion' | 'weak-signal' | 'abnormal' | 'persistent'
    this.cycling = false;
    this.cycleIndex = 0;
    this.cycleTimer = null;

    // Simulation baseline values
    this.baseBpm = 72;
    this.baseHrv = 52.0;
    this.baseGsr = 1650;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const packet = this.generatePacket();
      if (this.onPacket) {
        this.onPacket(packet);
      }
    }, 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
    this.cycling = false;
  }

  setForcedState(state) {
    this.cycling = false;
    if (this.cycleTimer) clearInterval(this.cycleTimer);
    this.forcedState = state;
  }

  startCycling() {
    this.cycling = true;
    const states = ['calm', 'medium', 'high', 'motion', 'weak-signal', 'abnormal'];
    this.cycleIndex = 0;
    this.forcedState = states[0];

    if (this.cycleTimer) clearInterval(this.cycleTimer);
    this.cycleTimer = setInterval(() => {
      this.cycleIndex = (this.cycleIndex + 1) % states.length;
      this.forcedState = states[this.cycleIndex];
    }, 12000); // switch state every 12 seconds to observe transitions
  }

  stopCycling() {
    this.cycling = false;
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
  }

  generatePacket() {
    const jitter = (range) => (Math.random() - 0.5) * range;

    let bpm = this.baseBpm + jitter(4);
    let hrv = this.baseHrv + jitter(3);
    let gsr = this.baseGsr + jitter(40);
    let motion = 0.05 + Math.random() * 0.08;
    let quality = 4;

    switch (this.forcedState) {
      case 'calm':
        bpm = 70 + jitter(3);
        hrv = 55 + jitter(4);
        gsr = 1600 + jitter(30);
        motion = 0.02;
        quality = 4;
        break;

      case 'medium':
        // ~20% HRV drop, ~15% GSR increase
        bpm = 78 + jitter(3);
        hrv = 41 + jitter(2);
        gsr = 1880 + jitter(40);
        motion = 0.04;
        quality = 3;
        break;

      case 'high':
      case 'persistent':
        // ~40% HRV drop, ~35% GSR increase
        bpm = 88 + jitter(4);
        hrv = 28 + jitter(2);
        gsr = 2300 + jitter(60);
        motion = 0.06;
        quality = 3;
        break;

      case 'motion':
        // High motion level above 0.5 threshold
        bpm = 82 + jitter(6);
        hrv = 45 + jitter(5);
        gsr = 1750 + jitter(50);
        motion = 0.88 + Math.random() * 0.4;
        quality = 2;
        break;

      case 'weak-signal':
        // Optical signal quality drops to 0 or 1
        bpm = 74 + jitter(5);
        hrv = 38 + jitter(5);
        gsr = 1700 + jitter(40);
        motion = 0.05;
        quality = 1;
        break;

      case 'abnormal':
        // Sensor artifact reading > 180 or < 40
        bpm = Math.random() > 0.5 ? 195 : 32;
        hrv = -1; // invalid
        gsr = 1600;
        motion = 0.02;
        quality = 3;
        break;

      default:
        // Natural resting wander
        bpm = this.baseBpm + jitter(4);
        hrv = this.baseHrv + jitter(4);
        gsr = this.baseGsr + jitter(40);
        motion = 0.04;
        quality = 4;
        break;
    }

    const raw = formatBlePacket(bpm, hrv, gsr, motion, quality);
    return {
      bpm: Math.round(bpm * 10) / 10,
      hrv: Math.round(hrv * 10) / 10,
      gsr: Math.round(gsr * 10) / 10,
      motion: Math.round(motion * 100) / 100,
      quality,
      timestamp: Date.now(),
      raw,
    };
  }
}
