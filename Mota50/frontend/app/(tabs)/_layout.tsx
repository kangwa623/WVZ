import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors } from '@/theme';
import Icon from '@/components/common/Icon';

export default function TabsLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;

  // Define tabs based on user role
  const getTabs = () => {
    if (role === 'driver' || role === 'non_driver') {
      return [
        { name: 'index', title: 'Dashboard', icon: 'dashboard' },
        { name: 'bookings', title: 'Bookings', icon: 'event' },
        { name: 'trips', title: 'Trips', icon: 'directions-car' },
        { name: 'violations', title: 'Violations', icon: 'warning' },
        { name: 'profile', title: 'Profile', icon: 'person' },
      ];
    } else if (role === 'staff') {
      return [
        { name: 'index', title: 'Dashboard', icon: 'dashboard' },
        { name: 'bookings', title: 'Bookings', icon: 'event' },
        { name: 'trips', title: 'Trips', icon: 'directions-car' },
        { name: 'violations', title: 'Violations', icon: 'warning' },
        { name: 'profile', title: 'Profile', icon: 'person' },
      ];
    } else if (role === 'fleet_manager') {
      return [
        { name: 'index', title: 'Dashboard', icon: 'dashboard' },
        { name: 'fleet', title: 'Fleet', icon: 'local-shipping' },
        { name: 'bookings', title: 'Bookings', icon: 'event' },
        { name: 'profile', title: 'Profile', icon: 'person' },
      ];
    } else if (role === 'finance_officer' || role === 'finance') {
      return [
        { name: 'index', title: 'Finance', icon: 'account-balance' },
        { name: 'reports', title: 'Reports', icon: 'assessment' },
        { name: 'profile', title: 'Profile', icon: 'person' },
      ];
    } else if (role === 'admin') {
      return [
        { name: 'index', title: 'Admin', icon: 'admin-panel-settings' },
        { name: 'fleet', title: 'Fleet', icon: 'local-shipping' },
        { name: 'bookings', title: 'Bookings', icon: 'event' },
        { name: 'reports', title: 'Reports', icon: 'assessment' },
        { name: 'profile', title: 'Profile', icon: 'person' },
      ];
    }
    return [
      { name: 'index', title: 'Dashboard', icon: 'dashboard' },
      { name: 'profile', title: 'Profile', icon: 'person' },
    ];
  };

  const tabs = getTabs();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.base.white,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.light,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerShown: tab.name === 'index' ? false : true, // Hide header for dashboard
            tabBarIcon: ({ color, size }) => (
              <Icon
                name={tab.icon}
                size={size}
                color={color}
                iconSet="MaterialIcons"
              />
            ),
          }}
        />
      ))}
      {/* Explicitly hide fleet tab for drivers and staff */}
      {(role === 'driver' || role === 'non_driver' || role === 'staff') && (
        <Tabs.Screen
          name="fleet"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      )}
    </Tabs>
  );
}
