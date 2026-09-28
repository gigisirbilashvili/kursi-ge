import type {
  ICurrency,
  IMarketSnapshot,
} from "../../../../../entities/currency";
import type { ISignificantAlert } from "../../../../../features/significant-alerts";

export interface IMarketPanelProps {
  currencies: readonly ICurrency[];
  snapshot: IMarketSnapshot;
  onRetry: () => void;
  alerts: readonly ISignificantAlert[];
  onDismissAlert: (id: number) => void;
}
