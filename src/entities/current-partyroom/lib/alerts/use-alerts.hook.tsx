import useGradeAdjustedAlert from './use-grade-adjusted-alert.hook';
import usePenaltyAlert from './use-penalty-alert.hook';

export default function useAlerts() {
  useGradeAdjustedAlert();
  usePenaltyAlert();
}
