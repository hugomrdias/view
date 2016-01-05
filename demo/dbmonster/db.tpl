<table class="table table-striped latest-data">
    <tbody>
        <% _.each(data.dbs, function(db) { %>
            <tr>
                <td class="dbname">
                    <%= db.name %>
                </td>
                <td class="query-count">
                    <span class="<%= db.countClassName %>">
                        <%= db.queries.length %>
                    </span>
                </td>
                <% _.each(db.topFiveQueries, function(query) { %>
                    <td class="Query <%= query.className %>">
                        <%= query.elapsed %>
                        <div class="popover left">
                            <div class="popover-content"><%= query.query %></div>
                            <div class="arrow"></div>
                        </div>
                    </td>
                <% });%>
            </tr>
        <% });%>
    </tbody>
</table>
