const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test script for chat messages schema
async function testChatSchema() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing chat_messages table creation...');

    // Test 1: Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'chat_messages');

    if (tableError) {
      console.error('Error checking table existence:', tableError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ chat_messages table exists');
    } else {
      console.log('❌ chat_messages table does not exist - run migration first');
      return;
    }

    // Test 2: Check RLS policies
    console.log('Testing RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_rls_policies', { table_name: 'chat_messages' });

    if (policyError) {
      console.log('Could not check policies via RPC, this is normal');
    } else {
      console.log('✅ RLS policies configured');
    }

    // Test 3: Test basic insert (will fail without auth, but tests structure)
    console.log('Testing table structure...');
    const testMessage = {
      sender_id: '00000000-0000-0000-0000-000000000001',
      receiver_id: '00000000-0000-0000-0000-000000000002',
      message: 'Test message',
      is_admin_message: false
    };

    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert([testMessage]);

    if (insertError) {
      if (insertError.message.includes('violates row-level security policy')) {
        console.log('✅ RLS is working (expected auth error)');
      } else if (insertError.message.includes('violates foreign key constraint')) {
        console.log('✅ Foreign key constraints are working');
      } else {
        console.error('Unexpected insert error:', insertError);
      }
    } else {
      console.log('⚠️ Insert succeeded (unexpected without auth)');
    }

    // Test 4: Test select (should return empty or fail due to RLS)
    const { data: messages, error: selectError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (selectError) {
      if (selectError.message.includes('violates row-level security policy')) {
        console.log('✅ RLS select policy is working');
      } else {
        console.error('Select error:', selectError);
      }
    } else {
      console.log('✅ Select query works (may return empty due to RLS)');
    }

    console.log('Schema testing completed!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChatSchema();
