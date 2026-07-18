import { createClient } from '@/utils/supabase/client';
import { Database } from './database.types';
import { IdentifyPlantFromImageOutput } from '@/ai/flows/identify-plant-from-image';
import type { User } from '@supabase/supabase-js';

// Type for plant in user's garden
export type GardenPlant = Database['public']['Tables']['garden_plants']['Row'];
export type SavedPlantInput = Database['public']['Tables']['garden_plants']['Insert'];

// Helper function to get authenticated user
async function getAuthenticatedUser(): Promise<{ user: User; error: null } | { user: null; error: Error }> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error || new Error('User not authenticated') };
  }
  
  return { user, error: null };
}

// Save a plant to the user's garden
export async function savePlantToGarden(
  plantData: IdentifyPlantFromImageOutput,
  imageUrl: string
): Promise<{ data: GardenPlant | null; error: Error | unknown }> {
  const supabase = createClient();
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return { data: null, error: authError };
    }

    const userId = user.id;

    // Check if plant already exists for this user to avoid duplicates
    const { data: existingPlant, error: checkError } = await supabase
      .from('garden_plants')
      .select('id')
      .eq('user_id', userId)
      .eq('scientific_name', plantData.scientificName)
      .maybeSingle();

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (existingPlant) {
      return { data: existingPlant as GardenPlant, error: null };
    }

    const plantToSave: SavedPlantInput = {
      user_id: userId,
      scientific_name: plantData.scientificName,
      common_name: plantData.commonName,
      hindi_name: plantData.hindiName || null,
      description: plantData.description,
      uses: plantData.uses,
      benefits: plantData.benefits,
      native_region: plantData.nativeRegion,
      growing_conditions: plantData.growingConditions,
      is_poisonous: plantData.isPoisonous,
      toxicity_details: plantData.toxicityDetails || null,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from('garden_plants')
      .insert(plantToSave)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: new Error('This plant already exists in your garden.') };
      } else if (error.code === '42P01') {
        return { data: null, error: new Error('Database table not found. The application may need to be updated.') };
      } else if (error.code === '42501') {
        return { data: null, error: new Error('You do not have permission to save plants. Please log in again.') };
      }
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: unknown) {
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred while saving the plant.') 
    };
  }
}

// Get all plants in the user's garden
export async function getUserGarden(): Promise<{ data: GardenPlant[] | null; error: Error | unknown }> {
  const supabase = createClient();
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return { data: null, error: authError };
    }

    const { data, error } = await supabase
      .from('garden_plants')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Get a specific plant from the user's garden
export async function getGardenPlant(id: string): Promise<{ data: GardenPlant | null; error: Error | unknown }> {
  const supabase = createClient();
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return { data: null, error: authError };
    }
    
    const { data, error } = await supabase
      .from('garden_plants')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update a plant's notes
export async function updatePlantNotes(id: string, notes: string): Promise<{ data: unknown; error: Error | unknown }> {
  const supabase = createClient();
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return { data: null, error: authError };
    }
    
    const { data, error } = await supabase
      .from('garden_plants')
      .update({ notes })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single(); // Added select and single to return the updated plant

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete a plant from the user's garden
export async function deletePlantFromGarden(id: string): Promise<{ error: Error | unknown }> {
  const supabase = createClient();
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return { error: authError };
    }
    
    const { error } = await supabase
      .from('garden_plants')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return { error };
  } catch (error) {
    return { error };
  }
}
