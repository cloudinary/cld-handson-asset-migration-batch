#
# The expression requires explicitly passing `pubid_field` argument
# to specify the column name from the input file that contains the
# public_id of the migrated asset.
#
# Example:
# --------
# $ tail -f log.jsonl | \
#     jq --arg pubid_field "<Public Id Column Name>" \ -r -f trace-migration-ops.jq
#
def pad_right(n): . + " " * (n - length);

select(.flow == "payload") |
"\t" as $separator |
if .input | has($pubid_field) | not then
    error("Input does not contain the specified field: '\($pubid_field)'")
end |
.input[$pubid_field] as $public_id |
if .summary.status == "MIGRATED" then
    if .response | has("overwritten") then
        ["🟡", ("overwritten"      | pad_right(20)), $public_id] | join($separator)
    elif .response | has("existing") then
        ["⚪️", ("skipped existing" | pad_right(20)), $public_id] | join($separator)
    else
        ["🟢", ("created"          | pad_right(20)), $public_id] | join($separator)
    end
else
    ["🔴", ("failed" | pad_right(20)), $public_id, (.summary.err | tostring)] | join($separator)
end
