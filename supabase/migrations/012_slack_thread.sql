-- Track the originating Slack thread on requests so we can reply in-thread later
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS slack_thread_ts  text,
  ADD COLUMN IF NOT EXISTS slack_channel_id text;
