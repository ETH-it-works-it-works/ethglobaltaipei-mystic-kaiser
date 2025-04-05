import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET endpoint to retrieve events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific event
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data });
    } else {
      // Get all events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('Error retrieving events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to create a new event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, address, image_url } = body;
    
    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and contract address are required' }, 
        { status: 400 }
      );
    }
    
    // Create new event
    const { data, error } = await supabase
      .from('events')
      .insert([
        { 
          name, 
          description, 
          address,
          image_url: image_url || null
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH endpoint to update an event
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, address, image_url } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' }, 
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (image_url !== undefined) updateData.image_url = image_url;
    
    // Update event
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE endpoint to delete an event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' }, 
        { status: 400 }
      );
    }
    
    // Delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 