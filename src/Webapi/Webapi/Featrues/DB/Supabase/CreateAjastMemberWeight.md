create or replace function adjust_member_weight(
  p_browser_uuid text,
  p_member_id int,
  p_multiplier double precision -- e.g., 1.05 for +5% or 0.95 for -5%
)
returns void as $$
begin
  update browser_weights
  set member_weights = (
    select jsonb_agg(
      case 
        when (elem->>'MemberId')::int = p_member_id 
        then jsonb_set(elem, '{Knowlage}', to_jsonb((elem->>'Knowlage')::double precision * p_multiplier))
        else elem
      end
    )
    from jsonb_array_elements(member_weights) as elem
  )
  where browser_uuid = p_browser_uuid;
end;
$$ language plpgsql;
