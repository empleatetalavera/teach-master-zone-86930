
-- =========================================================
-- Helper functions (SECURITY DEFINER, no recursion)
-- =========================================================

create or replace function public.get_user_center_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select training_center_id
  from public.profiles
  where id = _user_id
  limit 1
$$;

create or replace function public.user_can_access_course(_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(auth.uid(), 'super_admin')
    or exists (
      select 1
      from public.courses c
      where c.id = _course_id
        and c.training_center_id is not distinct from public.get_user_center_id(auth.uid())
        and c.training_center_id is not null
    )
$$;

create or replace function public.user_can_access_enrollment(_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(auth.uid(), 'super_admin')
    or exists (
      select 1
      from public.enrollments e
      join public.courses c on c.id = e.course_id
      where e.id = _enrollment_id
        and c.training_center_id is not distinct from public.get_user_center_id(auth.uid())
        and c.training_center_id is not null
    )
$$;

create or replace function public.user_can_access_module(_module_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(auth.uid(), 'super_admin')
    or exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = _module_id
        and c.training_center_id is not distinct from public.get_user_center_id(auth.uid())
        and c.training_center_id is not null
    )
$$;

-- =========================================================
-- COURSES
-- =========================================================
drop policy if exists "Admins and teachers can manage courses" on public.courses;

create policy "Admins/teachers manage courses in their center"
on public.courses
for all
to authenticated
using (
  public.has_role(auth.uid(), 'super_admin')
  or (
    (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher'))
    and training_center_id is not null
    and training_center_id = public.get_user_center_id(auth.uid())
  )
)
with check (
  public.has_role(auth.uid(), 'super_admin')
  or (
    (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher'))
    and training_center_id is not null
    and training_center_id = public.get_user_center_id(auth.uid())
  )
);

-- =========================================================
-- MODULES
-- =========================================================
drop policy if exists "Admins and teachers can manage modules" on public.modules;

create policy "Admins/teachers manage modules in their center"
on public.modules
for all
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
)
with check (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
);

-- =========================================================
-- EVALUATIONS
-- =========================================================
drop policy if exists "Admins and teachers can manage evaluations" on public.evaluations;

create policy "Admins/teachers manage evaluations in their center"
on public.evaluations
for all
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
)
with check (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
);

-- =========================================================
-- ENROLLMENTS
-- =========================================================
drop policy if exists "Teachers and admins can view all enrollments" on public.enrollments;
drop policy if exists "Admins can create enrollments for any user" on public.enrollments;
drop policy if exists "Admins can delete enrollments" on public.enrollments;

create policy "Teachers/admins view enrollments in their center"
on public.enrollments
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
);

create policy "Admins create enrollments in their center"
on public.enrollments
for insert
to authenticated
with check (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
);

create policy "Admins delete enrollments in their center"
on public.enrollments
for delete
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_course(course_id)
);

-- =========================================================
-- ACTIVITY SUBMISSIONS
-- =========================================================
drop policy if exists "Teachers can view all submissions" on public.activity_submissions;
drop policy if exists "Teachers can grade submissions" on public.activity_submissions;

create policy "Teachers/admins view submissions in their center"
on public.activity_submissions
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);

create policy "Teachers/admins grade submissions in their center"
on public.activity_submissions
for update
to authenticated
using (
  (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
)
with check (
  (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);

-- =========================================================
-- EVALUATION ATTEMPTS
-- =========================================================
drop policy if exists "Admins and teachers can view all attempts" on public.evaluation_attempts;

create policy "Teachers/admins view attempts in their center"
on public.evaluation_attempts
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);

-- =========================================================
-- MODULE / UNIT / SCORM PROGRESS
-- =========================================================
drop policy if exists "Teachers and admins can view all progress" on public.module_progress;

create policy "Teachers/admins view module progress in their center"
on public.module_progress
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);

drop policy if exists "Teachers and admins can view all unit progress" on public.unit_progress;

create policy "Teachers/admins view unit progress in their center"
on public.unit_progress
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);

drop policy if exists "Teachers and admins can view all SCORM progress" on public.scorm_progress;

create policy "Teachers/admins view SCORM progress in their center"
on public.scorm_progress
for select
to authenticated
using (
  (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'super_admin'))
  and public.user_can_access_enrollment(enrollment_id)
);
