export const createRunSelectQuery = (
  tableName: string,
  project_dir: string
) => `from dbt.task.base import ConfiguredTask
from dbt.adapters.factory import get_adapter
from pathlib import Path

class RunQueryTask(ConfiguredTask):
    def run(self):
        adapter = get_adapter(self.config)
        adapter.acquire_connection('run_query_connection')
        sql, table = adapter.execute('select * from ${tableName};', True, True)
        adapter.release_connection()
        table.limit(0, 100).print_table()


class Args:
    def __init__(self, project_dir, profiles_dir):
        self.project_dir = project_dir
        self.profiles_dir = profiles_dir


run_query_task = RunQueryTask.from_args( 
    Args('${project_dir}', Path.home().joinpath('.dbt')))
run_query_task.run()`;
// TODO move this to separate py file
// TODO find the init log in the DBT source code to get rid of the args
