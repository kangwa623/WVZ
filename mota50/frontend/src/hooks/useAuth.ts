import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isDriver: user?.role === 'driver',
    isNonDriver: user?.role === 'non_driver',
    isFleetManager: user?.role === 'fleet_manager',
    isFinanceOfficer: user?.role === 'finance_officer',
    isComplianceOfficer: user?.role === 'compliance_officer',
  };
};
