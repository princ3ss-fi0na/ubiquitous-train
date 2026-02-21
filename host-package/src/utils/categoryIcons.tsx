import React from "react";
import {
  EngineIcon,
  BrakesIcon,
  SuspensionIcon,
  FilterIcon,
  ElectricIcon,
  CarIcon,
  ExhaustIcon,
  CoolingIcon,
  OilIcon,
  TyresIcon,
} from "../components/Icons";

export const categoryIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  engine: EngineIcon,
  brakes: BrakesIcon,
  suspension: SuspensionIcon,
  filters: FilterIcon,
  electrics: ElectricIcon,
  body: CarIcon,
  exhaust: ExhaustIcon,
  cooling: CoolingIcon,
  oils: OilIcon,
  tyres: TyresIcon,
};
