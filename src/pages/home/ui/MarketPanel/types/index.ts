import type {
  ICurrency,
} from "../../../../../entities/currency";
import type { ISignificantAlert } from "../../../../../features/significant-alerts";

export interface IMarketPanelProps {
  currencies: readonly ICurrency[];
  alerts: readonly ISignificantAlert[];
  onDismissAlert: (id: number) => void;
}
