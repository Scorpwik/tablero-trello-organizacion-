-- Hangar Orbital · Migración 004 · Spec 07 (completar una misión)

alter table misiones
  add column estado text not null default 'pendiente'
  check (estado in ('pendiente', 'completada'));

create or replace function completar_mision(p_mision_id uuid, p_combustible integer)
returns naves
language plpgsql
security invoker
as $$
declare
  v_nave_id uuid;
  v_nave naves;
begin
  if p_combustible is null or p_combustible < 0 or p_combustible > 100 then
    raise exception 'El combustible debe ser un número entero entre 0 y 100.';
  end if;

  update misiones
     set estado = 'completada'
   where id = p_mision_id
     and estado = 'pendiente'
  returning nave_id into v_nave_id;

  if v_nave_id is null then
    raise exception 'la misión no existe o ya estaba completada';
  end if;

  update naves
     set combustible = p_combustible
   where id = v_nave_id
  returning * into v_nave;

  if v_nave is null then
    raise exception 'no se encontró la nave de la misión';
  end if;

  return v_nave;
end;
$$;

grant update (estado) on table misiones to anon;
grant update (combustible) on table naves to anon;
grant execute on function completar_mision(uuid, integer) to anon;

create policy "anon puede completar misiones"
  on misiones for update to anon
  using (estado = 'pendiente')
  with check (estado = 'completada');

create policy "anon puede actualizar combustible"
  on naves for update to anon
  using (true)
  with check (true);
