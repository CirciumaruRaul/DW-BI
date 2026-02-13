const sync_query = [
`TRUNCATE TABLE dim_shipping_companies`,
`TRUNCATE TABLE dim_ships`,
`TRUNCATE TABLE dim_ports`,
`TRUNCATE TABLE dim_docks`,
`TRUNCATE TABLE dim_status`,
`TRUNCATE TABLE dim_voyage_profiles`,
`TRUNCATE TABLE dim_time`,
`TRUNCATE TABLE fact_shipments`,
`INSERT INTO dim_shipping_companies (
    company_name, 
    scac_code, 
    imo_company_code, 
    country_of_origin
)
SELECT 
    name,               
    scac_code, 
    imo_company_num,   
    country_of_origin
FROM app_user_oltp.shipments_companies src
WHERE NOT EXISTS (
    SELECT 1 
    FROM dim_shipping_companies dst 
    WHERE dst.scac_code = src.scac_code
)`,
`INSERT INTO dim_ships (
    company_id,
    imo_number,
    ship_name,
    build_year,
    teu_capacity,
    gross_tonnage,
    fuel_type,
    created_at,
    updated_at
)
SELECT 
    dim_c.id,              
    src_s.imo_number,
    src_s.ship_name,
    src_s.build_year,
    src_s.teu_capacity,
    src_s.gross_tonnage,
    src_s.fuel_type,
    SYSTIMESTAMP,          
    SYSTIMESTAMP            
FROM app_user_oltp.ships src_s
JOIN app_user_oltp.shipments_companies src_c 
    ON src_s.company_id = src_c.id
JOIN dim_shipping_companies dim_c 
    ON src_c.scac_code = dim_c.scac_code 
WHERE NOT EXISTS (
    SELECT 1 
    FROM dim_ships ds 
    WHERE ds.imo_number = src_s.imo_number
)`,
`INSERT INTO dim_ports (
    berth_number,
    berth_type
)
SELECT 
    berth_number, 
    type          
FROM app_user_oltp.ports src
WHERE NOT EXISTS (
    SELECT 1 
    FROM dim_ports dp 
    WHERE dp.berth_number = src.berth_number
)`, 
`INSERT INTO dim_docks (
    dock_name,
    un_locode,
    city,
    country,
    continent
)
SELECT 
    name,       
    un_locode,
    city,
    country,
    continent
FROM app_user_oltp.docks src
WHERE NOT EXISTS (
    SELECT 1 
    FROM dim_docks dd 
    WHERE dd.un_locode = src.un_locode
)`, 
`INSERT INTO dim_status ( status_type )
   SELECT DISTINCT z.status
     FROM app_user_oltp.shipments z
     WHERE z.status IS NOT NULL`,
`INSERT INTO dim_voyage_profiles (
    voyage_number,
    transport_type,
    is_international,
    created_at,
    updated_at
)
SELECT DISTINCT
    voyage_number,
    transport_type,
    is_international,
    SYSTIMESTAMP, 
    SYSTIMESTAMP  
FROM app_user_oltp.shipments src
WHERE NOT EXISTS (
    SELECT 1 
    FROM dim_voyage_profiles dvp 
    WHERE dvp.voyage_number = src.voyage_number
      AND dvp.transport_type = src.transport_type
      AND dvp.is_international = src.is_international
)`,
`INSERT INTO dim_time (
    calendar_date,
    year,
    month,
    day,
    hour,
    day_of_week,
    is_holiday,
    is_peak_season,
    is_weekend
)
with dates as (
    select date '2023-01-01' + ( level - 1 ) as d
      from dual
    connect by
       level <= ( date '2026-12-31' - date '2023-01-01' ) + 1
),
hours as (
    select level - 1 as h
      from dual
    connect by
       level <= 24
)
select 
    dt.d as calendar_date,
    extract(year from dt.d) as year,
    extract(month from dt.d) as month,
    extract(day from dt.d) as day,
    hr.h as hour,
    ( trunc(dt.d) - trunc(dt.d, 'IW') ) + 1 as day_of_week,
    case
       when to_char(dt.d, 'MMDD') in ( '0101', '1225', '1226' ) then 1
       else 0
    end as is_holiday,
    case
       when hr.h between 7 and 10 or hr.h between 17 and 20 then 1
       else 0
    end as is_peak_season,
    case
       when ( trunc(dt.d) - trunc(dt.d, 'IW') ) + 1 in ( 6, 7 ) then 1
       else 0
    end as is_weekend
from dates dt
cross join hours hr
`,
`INSERT INTO fact_shipments (
    ship_id,
    port_id,
    departure_time_id,
    arrival_time_id,
    departure_dock_id,
    arrival_dock_id,
    voyage_profile_id,
    status_id,
    departure_timestamp,
    arrival_timestamp,
    direction,
    voyage_duration_hours,
    teu_utilized,
    crew_count,
    cargo_tonnage,
    port_fees,
    distance_nautical_miles,
    fuel_consumed,
    created_at,
    updated_at
)
WITH params AS (
    SELECT 500 AS base_port_fee,
           250 AS international_surcharge,
           15  AS fee_per_teu,
           0.05 AS fuel_rate_per_mile_per_ton
      FROM dual
), 
agg AS (
    SELECT s.id AS shipment_id,
           COUNT(ct.id) AS nr_containers,
           NVL(SUM(ct.tax_amount), 0) AS total_cargo_tax,
           (SELECT COUNT(*) FROM app_user_oltp.crew_ship_mapping csm WHERE csm.shipment_id = s.id) AS crew_count_calc
      FROM app_user_oltp.shipments s
      LEFT JOIN app_user_oltp.cargo_taxes ct ON ct.shipment_id = s.id
     GROUP BY s.id
)
SELECT ds.id,
       dp.id,
       dt_dep.id,
       dt_arr.id,
       dd_dep.id,
       dd_arr.id,
       dvp.id,
       dst.id,
       s.departure_date,
       s.arrival_date,
       (dd_dep.un_locode || ' -> ' || dd_arr.un_locode),
       ROUND((CAST(s.arrival_date AS DATE) - CAST(s.departure_date AS DATE)) * 24, 2),
       (a.nr_containers * 2),
       a.crew_count_calc,
       sh.gross_tonnage,
       (p.base_port_fee + (a.nr_containers * p.fee_per_teu) + CASE WHEN s.is_international = 1 THEN p.international_surcharge ELSE 0 END),
       s.distance_nm,
       ROUND(s.distance_nm * (sh.gross_tonnage / 1000) * p.fuel_rate_per_mile_per_ton, 2),
       SYSTIMESTAMP,
       SYSTIMESTAMP
  FROM app_user_oltp.shipments s
  JOIN app_user_oltp.ships sh ON sh.id = s.ship_id
  JOIN agg a ON a.shipment_id = s.id
  JOIN dim_ships ds ON ds.imo_number = sh.imo_number
  JOIN app_user_oltp.ports po ON po.id = s.berth_id
  JOIN dim_ports dp ON dp.berth_number = po.berth_number
  JOIN dim_status dst ON dst.status_type = s.status
  JOIN dim_voyage_profiles dvp ON dvp.voyage_number = s.voyage_number
   AND dvp.transport_type = s.transport_type
   AND dvp.is_international = s.is_international
  JOIN app_user_oltp.docks dock_dep ON dock_dep.id = s.departure_port_id
  JOIN app_user_oltp.docks dock_arr ON dock_arr.id = s.arrival_port_id
  JOIN dim_docks dd_dep ON dd_dep.un_locode = dock_dep.un_locode
  JOIN dim_docks dd_arr ON dd_arr.un_locode = dock_arr.un_locode
  JOIN dim_time dt_dep ON dt_dep.calendar_date = TRUNC(CAST(s.departure_date AS DATE))
   AND dt_dep.hour = EXTRACT(HOUR FROM CAST(s.departure_date AS TIMESTAMP))
  JOIN dim_time dt_arr ON dt_arr.calendar_date = TRUNC(CAST(s.arrival_date AS DATE))
   AND dt_arr.hour = EXTRACT(HOUR FROM CAST(s.arrival_date AS TIMESTAMP))
 CROSS JOIN params p`,
`COMMIT`
];
module.exports = {
    sync_query
}