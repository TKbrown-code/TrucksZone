import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Test script for chat messages schema
async function testChatSchema() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env.test');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing chat_messages table creation...');

    // Test 1: Check if table exists using a simple query
    const { data: testData, error: testError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);

    if (testError) {
      if (testError.message.includes('relation "public.chat_messages" does not exist')) {
        console.log('❌ chat_messages table does not exist - run migration first');
        console.log('💡 Run the SQL in chat_messages_migration.sql in your Supabase SQL editor');
        return;
      } else if (testError.message.includes('permission denied') || testError.message.includes('row-level security policy')) {
        console.log('✅ chat_messages table exists (RLS policy working)');
      } else {
        console.error('❌ Unexpected error:', testError.message);
        return;
      }
    } else {
      console.log('✅ chat_messages table exists and is accessible');
    }

    // Test 2: Test table structure by attempting an insert (should fail due to RLS)
    console.log('🔍 Testing RLS policies...');
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
        console.log('✅ RLS insert policy is working (expected auth error)');
      } else if (insertError.message.includes('violates foreign key constraint')) {
        console.log('✅ Foreign key constraints are working');
      } else if (insertError.message.includes('permission denied')) {
        console.log('✅ RLS policies are active');
      } else {
        console.log('⚠️ Insert error (may be expected):', insertError.message);
      }
    } else {
      console.log('⚠️ Insert succeeded (unexpected without authentication)');
    }

    // Test 3: Test functions if they exist
    console.log('🔍 Testing utility functions...');
    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_chat_statistics');

      if (statsError) {
        console.log('⚠️ get_chat_statistics function not found or not accessible');
      } else {
        console.log('✅ get_chat_statistics function works');
        console.log('📊 Chat stats:', stats);
      }
    } catch (funcError) {
      console.log('⚠️ Function testing failed:', funcError.message);
    }

    console.log('🎉 Schema testing completed!');
    console.log('📝 Next steps:');
    console.log('1. Run chat_messages_migration.sql in Supabase SQL editor');
    console.log('2. Test with authenticated users in your application');
    console.log('3. Verify real-time subscriptions work');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatSchema();
