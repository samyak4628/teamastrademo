import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DonationItem {
  id: string;
  foodName: string;
  category: 'Cooked Meals' | 'Bakery & Bread' | 'Fresh Produce' | 'Dairy & Refrigerated' | 'Packaged Goods' | 'Beverages';
  quantity: number;
  unit: 'servings' | 'kg' | 'meals' | 'boxes' | 'trays' | 'liters';
  description: string;
  dietaryTags: string[];
  photoUrl?: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupAddress: string;
  pickupInstructions?: string;
  status: 'available' | 'reserved' | 'volunteer_assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'completed' | 'cancelled';
  restaurantName: string;
  restaurantCity: string;
  reservedByNgoName?: string;
  assignedVolunteerName?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'donation_available' | 'donation_accepted' | 'volunteer_assigned' | 'picked_up' | 'delivered' | 'cancelled';
  timestamp: string;
  read: boolean;
  donationId?: string;
}

const STORAGE_KEY = 'resqfood_donations_v2';
const NOTIFICATIONS_KEY = 'resqfood_notifications_v2';

// Seed initial realistic donations for immediate operational demo
const INITIAL_DONATIONS: DonationItem[] = [
  {
    id: 'don-001',
    foodName: 'Vegetable Biryani & Dal Makhani Trays',
    category: 'Cooked Meals',
    quantity: 45,
    unit: 'meals',
    description: 'Fresh lunch buffet surplus packed in sealed aluminum catering containers. Kept warm until 2:30 PM.',
    dietaryTags: ['Vegetarian', 'Nut-Free'],
    pickupWindowStart: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    pickupAddress: 'The Spice Pavilion, 42 Connaught Place, New Delhi',
    pickupInstructions: 'Enter via rear kitchen loading bay. Ask for Chef Rajesh.',
    status: 'available',
    restaurantName: 'The Spice Pavilion',
    restaurantCity: 'New Delhi',
    urgencyLevel: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don-002',
    foodName: 'Artisan Sourdough & Croissants',
    category: 'Bakery & Bread',
    quantity: 20,
    unit: 'kg',
    description: 'Baked this morning. Includes whole wheat loaves, baguettes, and assorted pastries.',
    dietaryTags: ['Vegetarian'],
    pickupWindowStart: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    pickupAddress: 'Crust & Crumb Bakery, 18 Khan Market, New Delhi',
    pickupInstructions: 'Front counter pickup before 7:00 PM.',
    status: 'available',
    restaurantName: 'Crust & Crumb Bakery',
    restaurantCity: 'New Delhi',
    urgencyLevel: 'medium',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'don-003',
    foodName: 'Organic Salad Greens & Bell Peppers',
    category: 'Fresh Produce',
    quantity: 35,
    unit: 'kg',
    description: 'High-grade farm fresh produce from weekend banquet prep. Cleaned and crated.',
    dietaryTags: ['Vegan', 'Gluten-Free'],
    pickupWindowStart: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    pickupAddress: 'Greenleaf Kitchens, Sector 29, Gurugram',
    pickupInstructions: 'Loading dock B. Security will direct courier to cold storage.',
    status: 'reserved',
    restaurantName: 'Greenleaf Kitchens',
    restaurantCity: 'Gurugram',
    reservedByNgoName: 'Aasra Community Food Bank',
    urgencyLevel: 'low',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Donation Reserved',
    message: 'Aasra Community Food Bank reserved "Organic Salad Greens & Bell Peppers"',
    type: 'donation_accepted',
    timestamp: '25m ago',
    read: false,
    donationId: 'don-003'
  },
  {
    id: 'notif-2',
    title: 'New Surplus Nearby',
    message: 'The Spice Pavilion posted 45 hot meals ready for rescue.',
    type: 'donation_available',
    timestamp: '40m ago',
    read: false,
    donationId: 'don-001'
  }
];

export const useDonationStore = () => {
  const [donations, setDonations] = useState<DonationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DONATIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
    } catch {
      // ignore
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Load live donations from Supabase on mount
  const fetchLiveDonations = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[ResQFood] Live donations query notice:', error.message);
        return;
      }

      if (data && data.length > 0) {
        setDonations(prev => {
          const prevMap = new Map(prev.map(p => [p.id, p]));
          const liveItems: DonationItem[] = data.map((d: any) => {
            const prevItem = prevMap.get(d.id);
            return {
              id: d.id,
              foodName: d.food_name,
              category: d.food_category || 'Cooked Meals',
              quantity: Number(d.quantity) || 1,
              unit: d.unit || 'meals',
              description: d.description || '',
              dietaryTags: d.dietary_tags || ['Vegetarian'],
              photoUrl: d.photo_url,
              pickupWindowStart: d.pickup_window_start || new Date().toISOString(),
              pickupWindowEnd: d.pickup_window_end || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
              pickupAddress: d.pickup_address || 'Main Kitchen Address',
              pickupInstructions: d.pickup_instructions || '',
              status: d.status || 'available',
              restaurantName: prevItem?.restaurantName || d.pickup_address?.split(',')[0] || 'Kitchen Partner',
              restaurantCity: 'New Delhi',
              reservedByNgoName: prevItem?.reservedByNgoName || (d.reserved_by_ngo ? 'Partner Shelter' : undefined),
              assignedVolunteerName: prevItem?.assignedVolunteerName || (d.assigned_volunteer ? 'Assigned Volunteer' : undefined),
              urgencyLevel: prevItem?.urgencyLevel || 'high',
              createdAt: d.created_at || new Date().toISOString(),
            };
          });

          // Merge live items with local initial items that haven't been pushed to DB yet
          const liveIds = new Set(liveItems.map(i => i.id));
          const localOnly = prev.filter(p => !liveIds.has(p.id));
          return [...liveItems, ...localOnly];
        });
      }
    } catch (err) {
      console.warn('[ResQFood] Error in fetchLiveDonations:', err);
    }
  }, []);

  useEffect(() => {
    fetchLiveDonations();

    // Listen to realtime changes on donations table
    const client = supabase;
    if (client) {
      const channel = client
        .channel('public:donations_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'donations' },
          () => {
            fetchLiveDonations();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [fetchLiveDonations]);

  // Create a new donation
  const createDonation = async (newDonation: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => {
    const localId = `don-${Date.now().toString().slice(-4)}`;
    const item: DonationItem = {
      ...newDonation,
      id: localId,
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    // If Supabase is configured, write to database with authenticated user reference
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        let restaurantId: string | null = null;
        if (user) {
          const { data: rest } = await supabase
            .from('restaurants')
            .select('id')
            .or(`profile_id.eq.${user.id},owner_id.eq.${user.id}`)
            .maybeSingle();
          if (rest) restaurantId = rest.id;
        }

        const insertPayload: any = {
          food_name: item.foodName,
          food_category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description,
          dietary_tags: item.dietaryTags,
          pickup_window_start: item.pickupWindowStart,
          pickup_window_end: item.pickupWindowEnd,
          pickup_address: item.pickupAddress,
          pickup_instructions: item.pickupInstructions,
          status: 'available',
        };

        if (user) {
          insertPayload.created_by = user.id;
        }
        if (restaurantId) {
          insertPayload.restaurant_id = restaurantId;
        }

        const { data: inserted, error: insertErr } = await supabase
          .from('donations')
          .insert(insertPayload)
          .select('id')
          .maybeSingle();

        if (insertErr) {
          console.warn('[ResQFood] Supabase donation write notice:', insertErr.message);
        } else if (inserted?.id) {
          item.id = inserted.id;
        }
      } catch (err) {
        console.error('Supabase donation write error:', err);
      }
    }

    setDonations(prev => [item, ...prev]);

    // Dispatch notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Donation Posted',
      message: `${item.restaurantName} listed ${item.quantity} ${item.unit} of ${item.foodName}`,
      type: 'donation_available',
      timestamp: 'Just now',
      read: false,
      donationId: item.id
    };
    setNotifications(prev => [notif, ...prev]);

    return item;
  };

  // NGO Reservation
  const reserveDonation = async (donationId: string, ngoName: string): Promise<{ success: boolean; message: string }> => {
    const existing = donations.find(d => d.id === donationId);
    if (!existing) {
      return { success: false, message: 'Donation not found.' };
    }
    if (existing.status !== 'available') {
      return { success: false, message: `This donation has already been claimed by another organization.` };
    }

    // Update state atomically
    setDonations(prev =>
      prev.map(d =>
        d.id === donationId
          ? { ...d, status: 'reserved', reservedByNgoName: ngoName }
          : d
      )
    );

    // Sync to Supabase if UUID
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let ngoId: string | null = null;
        if (user) {
          const { data: ngo } = await supabase
            .from('ngos')
            .select('id')
            .or(`profile_id.eq.${user.id},owner_id.eq.${user.id}`)
            .maybeSingle();
          if (ngo) ngoId = ngo.id;
        }

        const updatePayload: Record<string, any> = { status: 'reserved' };
        if (ngoId) updatePayload.reserved_by_ngo = ngoId;

        await supabase
          .from('donations')
          .update(updatePayload)
          .eq('id', donationId);
      } catch (e) {
        console.warn('[ResQFood] Supabase reserve update notice:', e);
      }
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Donation Claimed',
      message: `${ngoName} successfully reserved "${existing.foodName}".`,
      type: 'donation_accepted',
      timestamp: 'Just now',
      read: false,
      donationId
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'Donation successfully reserved! You can now arrange volunteer pickup.' };
  };

  // Volunteer Task Assignment
  const assignVolunteer = async (donationId: string, volunteerName: string) => {
    setDonations(prev =>
      prev.map(d =>
        d.id === donationId
          ? { ...d, status: 'volunteer_assigned', assignedVolunteerName: volunteerName }
          : d
      )
    );

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const updatePayload: Record<string, any> = { status: 'volunteer_assigned' };
        if (user) updatePayload.assigned_volunteer = user.id;

        await supabase
          .from('donations')
          .update(updatePayload)
          .eq('id', donationId);

        if (user) {
          await supabase
            .from('volunteer_assignments')
            .upsert({
              donation_id: donationId,
              volunteer_id: user.id,
              status: 'assigned',
            });
        }
      } catch (e) {
        console.warn('[ResQFood] Supabase assign volunteer notice:', e);
      }
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Volunteer Dispatched',
      message: `${volunteerName} accepted delivery pickup for donation.`,
      type: 'volunteer_assigned',
      timestamp: 'Just now',
      read: false,
      donationId
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Advance Delivery Status
  const updateDonationStatus = async (donationId: string, newStatus: DonationItem['status']) => {
    setDonations(prev =>
      prev.map(d =>
        d.id === donationId ? { ...d, status: newStatus } : d
      )
    );

    if (supabase) {
      try {
        await supabase
          .from('donations')
          .update({ status: newStatus })
          .eq('id', donationId);

        if (newStatus === 'picked_up') {
          await supabase
            .from('volunteer_assignments')
            .update({ status: 'in_progress', pickup_confirmed_at: new Date().toISOString() })
            .eq('donation_id', donationId);
        } else if (newStatus === 'delivered' || newStatus === 'completed') {
          await supabase
            .from('volunteer_assignments')
            .update({ status: 'completed', delivery_confirmed_at: new Date().toISOString(), completed_at: new Date().toISOString() })
            .eq('donation_id', donationId);
        }
      } catch (e) {
        console.warn('[ResQFood] Supabase status update notice:', e);
      }
    }

    const statusTitles: Record<string, string> = {
      picked_up: 'Food Picked Up',
      on_the_way: 'Delivery In Transit',
      delivered: 'Delivered to Shelter',
      completed: 'Rescue Completed & Verified',
      cancelled: 'Donation Cancelled'
    };

    if (statusTitles[newStatus]) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: statusTitles[newStatus],
        message: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} for rescue dispatch.`,
        type: newStatus === 'cancelled' ? 'cancelled' : 'delivered',
        timestamp: 'Just now',
        read: false,
        donationId
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return {
    donations,
    notifications,
    createDonation,
    reserveDonation,
    assignVolunteer,
    updateDonationStatus,
    markNotificationRead,
    markAllNotificationsRead,
    fetchLiveDonations,
  };
};
