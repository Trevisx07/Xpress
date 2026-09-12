import Truck from './Truck.astro';
import Shield from './Shield.astro';
import Clock from './Clock.astro';
import MapPin from './MapPin.astro';
import Key from './Key.astro';
import Battery from './Battery.astro';

export const icons = { Truck, Shield, Clock, MapPin, Key, Battery };
export type IconName = keyof typeof icons;
