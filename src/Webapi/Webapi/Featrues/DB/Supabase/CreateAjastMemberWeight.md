create or replace function adjust_member_weight(
  p_browser_uuid text,
  p_member_id int,
  p_multiplier double precision
)
returns void as $$
begin
  update browser_weights
  set member_weights = case 
    -- 1. If the MemberId already exists in the array, loop and multiply
    when member_weights @> jsonb_build_array(jsonb_build_object('MemberId', p_member_id)) then
      (
        select jsonb_agg(
          case 
            when (elem->>'MemberId')::int = p_member_id 
            then jsonb_set(elem, '{Knowlage}', to_jsonb((elem->>'Knowlage')::double precision * p_multiplier))
            else elem
          end
        )
        from jsonb_array_elements(member_weights) as elem
      )
    -- 2. If it DOES NOT exist, append a new object with a default base weight
    else 
      member_weights || jsonb_build_array(
        jsonb_build_object(
          'MemberId', p_member_id,
          'Knowlage', 1.0 * p_multiplier
        )
      )
  end
  where browser_uuid = p_browser_uuid;
end;
$$ language plpgsql;
